const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../database/db');
const config = require('../config');

// typeAdmin: 1=superadmin, 2=admin, 3=directeur, 4=intendant
// typePersonne: 2=enseignant, 3=parent
const ADMIN_ROLE_MAP = { 1: 'superadmin', 2: 'admin', 3: 'directeur', 4: 'intendant' };
const PERSONNE_ROLE_MAP = { 2: 'enseignant', 3: 'parent' };

// Helper: chercher admin par login (username ou login)
async function findAdmin(credential) {
  let [rows] = await pool.query(
    'SELECT * FROM Admin WHERE (login = ? OR username = ?) AND actif = 1',
    [credential, credential]
  );
  // fallback: table may have column 'login' or 'username'
  if (rows.length === 0) {
    [rows] = await pool.query(
      'SELECT * FROM Admin WHERE actif = 1 AND (login = ? OR username = ?)',
      [credential, credential]
    ).catch(() => [[]]);
  }
  return rows[0] || null;
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const credential = (email || username || '').trim();
    if (!credential || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }

    // 1. Chercher dans Admin (superadmin, admin, directeur, intendant)
    const admin = await findAdmin(credential);
    if (admin) {
      const pwdField = admin.password || '';
      const ok = pwdField.startsWith('$2')
        ? await bcrypt.compare(password, pwdField)
        : password === pwdField;
      if (!ok) return res.status(401).json({ error: 'Mot de passe incorrect' });

      const role = ADMIN_ROLE_MAP[admin.typeAdmin] || 'admin';
      const payload = {
        id: admin.ID,
        login: admin.login || admin.username,
        nom: admin.nom,
        role,
        type: 'admin',
        typeAdmin: admin.typeAdmin,
      };
      const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      return res.json({ success: true, token, user: payload });
    }

    // 2. Chercher dans Personne (enseignants, parents)
    const [personnes] = await pool.query(
      'SELECT * FROM Personne WHERE username = ? OR mobile = ?',
      [credential, credential]
    );
    if (personnes.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    const personne = personnes[0];
    const pwdP = personne.password || '';
    const okP = pwdP.startsWith('$2')
      ? await bcrypt.compare(password, pwdP)
      : password === pwdP;
    if (!okP) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const roleP = PERSONNE_ROLE_MAP[personne.typePersonne] || 'user';

    let extra = {};
    if (roleP === 'enseignant') {
      const [ens] = await pool.query(
        'SELECT idEnseignant, idCours FROM Enseignant WHERE idPers = ? AND Actif = 1',
        [personne.idPers]
      );
      extra = ens[0] ? { idEnseignant: ens[0].idEnseignant, idCours: ens[0].idCours } : {};
    } else if (roleP === 'parent') {
      const [par] = await pool.query(
        `SELECT pr.idParent, pr.matricule, e.nom AS eleveNom, e.prenom AS elevePrenom
         FROM Parents pr LEFT JOIN Eleve e ON e.matricule = pr.matricule
         WHERE pr.idPers = ?`,
        [personne.idPers]
      );
      if (par.length > 0) {
        extra = {
          idParent: par[0].idParent,
          matricule: par[0].matricule,
          eleveNom: par[0].eleveNom,
          elevePrenom: par[0].elevePrenom,
        };
      }
    }

    const payload = {
      id: personne.idPers,
      nom: personne.nom,
      prenom: personne.prenom,
      username: personne.username,
      role: roleP,
      type: 'personne',
      typePersonne: personne.typePersonne,
      ...extra,
    };
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return res.json({ success: true, token, user: payload });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => res.json({ user: req.user });

// ─── SIGNUP ─────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { role, nom, prenom, username, email, password, mobile, phone, matricule } = req.body;
    if (!role || !nom || !prenom || !username || !password) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const bcryptPwd = await bcrypt.hash(password, 10);

    // Admin table roles: superadmin(1), admin(2), directeur(3), intendant(4)
    const adminRoles = ['superadmin', 'admin', 'directeur', 'intendant'];
    if (adminRoles.includes(role)) {
      const typeAdmin = role === 'superadmin' ? 1 : role === 'admin' ? 2 : role === 'directeur' ? 3 : 4;
      // Check username unique
      const [existing] = await pool.query('SELECT ID FROM Admin WHERE login = ? OR username = ?', [username, username]);
      if (existing.length > 0) return res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });

      await pool.query(
        `INSERT INTO Admin (login, username, password, nom, typeAdmin, actif, mobile, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
        [username, username, bcryptPwd, `${prenom} ${nom}`, typeAdmin, mobile || '']
      );
      return res.status(201).json({ message: 'Compte créé avec succès', role });
    }

    // Personne table roles: enseignant(2), parent(3)
    const [existP] = await pool.query('SELECT idPers FROM Personne WHERE username = ?', [username]);
    if (existP.length > 0) return res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });

    const [next] = await pool.query('SELECT COALESCE(MAX(idPers),999)+1 AS nextId FROM Personne');
    const idPers = next[0]?.nextId || 1000;
    const typePersonne = role === 'enseignant' ? 2 : 3;

    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '2000-01-01', '', ?, 1, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', username, bcryptPwd, typePersonne]
    );

    if (role === 'enseignant') {
      await pool.query(
        'INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin, created_at) VALUES (?, NULL, 1, 1, NOW())',
        [idPers]
      );
    } else if (role === 'parent') {
      await pool.query(
        'INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, 1, NOW())',
        [idPers, matricule || null]
      );
    }

    res.status(201).json({ message: 'Compte créé avec succès', role });
  } catch (error) {
    console.error('signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── CREATE USER (admin only) ────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  try {
    const { role, nom, prenom, username, password, mobile, matricule } = req.body;
    if (!role || !nom || !username || !password) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Only admin/superadmin can create accounts
    const callerRole = req.user?.role;
    if (!['admin', 'superadmin'].includes(callerRole)) {
      return res.status(403).json({ error: 'Permission refusée' });
    }

    const bcryptPwd = await bcrypt.hash(password, 10);

    const adminRoles = ['superadmin', 'admin', 'directeur', 'intendant'];
    if (adminRoles.includes(role)) {
      const typeAdmin = role === 'superadmin' ? 1 : role === 'admin' ? 2 : role === 'directeur' ? 3 : 4;
      const [ex] = await pool.query('SELECT ID FROM Admin WHERE login = ? OR username = ?', [username, username]);
      if (ex.length > 0) return res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });
      const [r] = await pool.query(
        `INSERT INTO Admin (login, username, password, nom, typeAdmin, actif, mobile, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
        [username, username, bcryptPwd, `${prenom || ''} ${nom}`.trim(), typeAdmin, mobile || '']
      );
      return res.status(201).json({ message: 'Compte créé', id: r.insertId, role });
    }

    // enseignant ou parent
    const [exP] = await pool.query('SELECT idPers FROM Personne WHERE username = ?', [username]);
    if (exP.length > 0) return res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });

    const [next] = await pool.query('SELECT COALESCE(MAX(idPers),999)+1 AS nextId FROM Personne');
    const idPers = next[0]?.nextId || 1000;
    const typePersonne = role === 'enseignant' ? 2 : 3;

    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, '2000-01-01', '', ?, 1, NOW())`,
      [idPers, nom, prenom || '', mobile || '', username, bcryptPwd, typePersonne]
    );

    if (role === 'enseignant') {
      await pool.query('INSERT INTO Enseignant (idPers, Actif, idAdmin, created_at) VALUES (?, 1, 1, NOW())', [idPers]);
    } else {
      await pool.query('INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, 1, NOW())', [idPers, matricule || null]);
    }

    res.status(201).json({ message: 'Compte créé', idPers, role });
  } catch (error) {
    console.error('createUser error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ─── LIST USERS (admin only) ─────────────────────────────────────────────────
exports.listUsers = async (req, res) => {
  try {
    const [admins] = await pool.query(
      `SELECT ID as id, login as username, nom, typeAdmin,
       CASE typeAdmin WHEN 1 THEN 'superadmin' WHEN 2 THEN 'admin' WHEN 3 THEN 'directeur' WHEN 4 THEN 'intendant' END as role,
       actif, mobile, created_at FROM Admin ORDER BY typeAdmin, nom`
    );
    const [personnes] = await pool.query(
      `SELECT p.idPers as id, p.username, p.nom, p.prenom, p.mobile, p.typePersonne, p.created_at,
       CASE p.typePersonne WHEN 2 THEN 'enseignant' WHEN 3 THEN 'parent' ELSE 'autre' END as role,
       COALESCE(e.Actif, 1) as actif
       FROM Personne p
       LEFT JOIN Enseignant e ON e.idPers = p.idPers
       WHERE p.typePersonne IN (2,3)
       ORDER BY p.typePersonne, p.nom`
    );
    res.json({ admins, personnes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── TOGGLE USER ACTIVE ──────────────────────────────────────────────────────
exports.toggleUser = async (req, res) => {
  try {
    const { id, type, actif } = req.body;
    if (type === 'admin') {
      await pool.query('UPDATE Admin SET actif = ? WHERE ID = ?', [actif ? 1 : 0, id]);
    } else {
      await pool.query('UPDATE Enseignant SET Actif = ? WHERE idPers = ?', [actif ? 1 : 0, id]);
    }
    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { id, type, newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword || 'Alanya2026!', 10);
    if (type === 'admin') {
      await pool.query('UPDATE Admin SET password = ? WHERE ID = ?', [hashed, id]);
    } else {
      await pool.query('UPDATE Personne SET password = ? WHERE idPers = ?', [hashed, id]);
    }
    res.json({ message: 'Mot de passe réinitialisé', temporaryPassword: newPassword || 'Alanya2026!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
