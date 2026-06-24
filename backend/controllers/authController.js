const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const config = require('../config');

// LOGIN UNIFIÉ — cherche dans Admin ET Personne
exports.login = async (req, res) => {
  try {
    const { email, password, username, login, credential: rawCredential } = req.body;
    const credential = rawCredential || login || email || username;
    if (!credential || !password) return res.status(400).json({ error: 'Identifiant et mot de passe requis' });

    // 1. Chercher dans Admin
    let admins;
    try {
      console.log('DB: querying Admin for', credential);
      [admins] = await pool.query(
        'SELECT * FROM Admin WHERE (login = ? OR username = ?) AND actif = 1',
        [credential, credential]
      );
      console.log('DB: Admin query returned', (admins && admins.length) || 0);
    } catch (dbErr) {
      console.error('DB query error (Admin):', dbErr && dbErr.message, dbErr);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    if (admins.length > 0) {
      const admin = admins[0];
      const ok = admin.password.startsWith('$2') ? await bcrypt.compare(password, admin.password) : password === admin.password;
      if (!ok) return res.status(401).json({ error: 'Mot de passe incorrect' });
      const roleMap = { 1: 'superadmin', 2: 'admin', 3: 'enseignant', 4: 'parent' };
      const role = roleMap[admin.typeAdmin] || 'admin';
      const token = jwt.sign({ id: admin.ID, login: admin.login, role, type: 'admin', typeAdmin: admin.typeAdmin }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      return res.json({ success: true, token, user: { id: admin.ID, nom: admin.nom, login: admin.login, role, type: 'admin', typeAdmin: admin.typeAdmin } });
    }

    // 2. Chercher dans Personne (enseignants et parents)
    const [personnes] = await pool.query('SELECT * FROM Personne WHERE username = ? OR login = ? LIMIT 1', [credential, credential]);
    if (personnes.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    const personne = personnes[0];
    const okP = personne.password.startsWith('$2') ? await bcrypt.compare(password, personne.password) : password === personne.password;
    if (!okP) return res.status(401).json({ error: 'Mot de passe incorrect' });

    // typePersonne: 2=enseignant, 3=parent
    const roleP = personne.typePersonne === 2 ? 'enseignant' : personne.typePersonne === 3 ? 'parent' : 'user';

    // Récupérer infos supplémentaires selon le rôle
    let extra = {};
    if (roleP === 'enseignant') {
      const [ens] = await pool.query('SELECT idEnseignant, idCours FROM Enseignant WHERE idPers = ? AND Actif = 1', [personne.idPers]);
      extra = ens.length > 0 ? { idEnseignant: ens[0].idEnseignant, idCours: ens[0].idCours } : {};
    } else if (roleP === 'parent') {
      const [par] = await pool.query(`SELECT pr.idParent, pr.matricule, e.nom AS eleveNom, e.prenom AS elevePrenom 
        FROM Parents pr LEFT JOIN Eleve e ON e.matricule = pr.matricule WHERE pr.idPers = ?`, [personne.idPers]);
      extra = par.length > 0 ? { idParent: par[0].idParent, matricule: par[0].matricule, eleveNom: par[0].eleveNom, elevePrenom: par[0].elevePrenom } : {};
    }

    const token = jwt.sign({ id: personne.idPers, username: personne.username, role: roleP, type: 'personne', typePersonne: personne.typePersonne, ...extra }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return res.json({
      success: true, token,
      user: { id: personne.idPers, nom: personne.nom, prenom: personne.prenom, username: personne.username, role: roleP, type: 'personne', typePersonne: personne.typePersonne, ...extra }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => res.json({ user: req.user });

// SIGNUP simple: crée Personne puis Enseignant/Parent selon le rôle
exports.signup = async (req, res) => {
  try {
    const { role, nom, prenom, username, email, password, mobile, phone, specialite, nomEnfant, etablissement } = req.body;
    if (!role || !nom || !prenom || !username || !password) return res.status(400).json({ error: 'Champs requis manquants' });

    // create idPers
    const [next] = await pool.query('SELECT COALESCE(MAX(idPers),0)+1 AS nextId FROM Personne');
    const idPers = next[0]?.nextId || 1000;

    const bcryptPwd = await bcrypt.hash(password, 10);

    // Insert Personne with defaults
    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '2000-01-01', '', ?, ?, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', username || email || `user${Date.now()}`, bcryptPwd, role === 'enseignant' ? 2 : role === 'parent' ? 3 : 1, 1]
    );

    // create role-specific record
    if (role === 'enseignant') {
      await pool.query('INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin, created_at) VALUES (?, NULL, 1, ?, NOW())', [idPers, 1]);
    } else if (role === 'parent') {
      await pool.query('INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, ?, NOW())', [idPers, nomEnfant || null, 1]);
    } else if (role === 'administrateur') {
      // rudimentary Admin creation (typeAdmin 2 = admin)
      const uname = username || email || `admin${Date.now()}`;
      await pool.query('INSERT INTO Admin (username, password, nom, typeAdmin, actif, created_at) VALUES (?, ?, ?, ?, 1, NOW())', [uname, bcryptPwd, `${prenom} ${nom}`, 2]);
    }

    res.status(201).json({ message: 'Compte créé' });
  } catch (error) {
    console.error('signup error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
