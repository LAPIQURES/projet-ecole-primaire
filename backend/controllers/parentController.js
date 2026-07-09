const pool = require('../database/db');
const bcrypt = require('bcrypt');

async function getNextIdPers() {
  const [rows] = await pool.query('SELECT COALESCE(MAX(idPers), 0) + 1 AS nextId FROM Personne');
  return rows[0].nextId;
}

exports.getParents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif,
        COUNT(DISTINCT pe.matricule) AS nbEnfants
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      LEFT JOIN ParentEleve pe ON pe.idPers = pr.idPers
      WHERE COALESCE(pr.isDelete, 0) = 0
      GROUP BY pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone
      ORDER BY p.nom, p.prenom`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getParentById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      WHERE pr.idParent = ?`, [req.params.id]);
    
    if (!rows.length) return res.status(404).json({ error: 'Parent non trouvé' });
    const parent = rows[0];
    
    const [children] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.photoURL, e.dateNaissance,
        s.libelle AS salle, s.idSalle, c.libelle AS classe, c.idClasse, cy.libelle AS cycle
      FROM ParentEleve pe
      JOIN Eleve e ON e.matricule = pe.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pe.idPers = ?
      ORDER BY e.nom, e.prenom`, [parent.idPers]);
    
    res.json({ ...parent, children, nbEnfants: children.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createParent = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, matricule, matricules, password, isUser = true, username: reqUsername } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis' });

    const idAdmin = req.user?.id || 1000;
    const idPers = await getNextIdPers();

    // Decide username/password based on isUser flag
    let username = null;
    let storedPassword = null;
    let plainPassword = null;

    if (isUser) {
      // prefer provided username
      if (reqUsername) {
        // ensure uniqueness
        const [exists] = await pool.query('SELECT idPers FROM Personne WHERE username = ? LIMIT 1', [reqUsername]);
        if (exists.length) return res.status(400).json({ error: 'Nom d\'utilisateur déjà utilisé' });
        username = reqUsername;
      } else {
        username = `parent${idPers}`;
      }
      plainPassword = password || '1234';
      if (!password) console.warn(`⚠️ Parent ${nom} ${prenom} created without password, using default: 1234`);
      storedPassword = await bcrypt.hash(plainPassword, 10);
    }

    // Insert parent person record; only set username/password if isUser
    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, typePersonne, dateNaissance, lieuNaissance, username, password, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, 3, '2000-01-01', '', ?, ?, ?, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', username, storedPassword, idAdmin]
    );

    const [result] = await pool.query(
      `INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, '', ?, NOW())`,
      [idPers, idAdmin]
    );

    // Handle children links: accept either single `matricule` or array `matricules`
    const children = Array.isArray(matricules) ? matricules : (matricule ? [matricule] : []);
    for (const m of children) {
      const [eleve] = await pool.query('SELECT matricule FROM Eleve WHERE matricule = ?', [m]);
      if (!eleve.length) return res.status(400).json({ error: `Élève non trouvé: ${m}` });
      const [existing] = await pool.query('SELECT * FROM ParentEleve WHERE idPers = ? AND matricule = ?', [idPers, m]);
      if (!existing.length) {
        await pool.query('INSERT INTO ParentEleve (idPers, matricule) VALUES (?, ?)', [idPers, m]);
      }
    }

    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone, p.username
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      WHERE pr.idParent = ?`, [result.insertId]);

    const created = rows[0];
    // Include login info for convenience in admin UI (plain password only when generated here)
    const loginInfo = isUser ? { username: created.username, password: plainPassword } : null;
    res.status(201).json({ parent: created, loginInfo });
  } catch (error) {
    console.error('createParent error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, matricule, matricules, password, isUser, username: reqUsername } = req.body;
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    const idPers = parent[0].idPers;

    // Update personal info including password if provided
    const updateFields = ['nom=?', 'prenom=?', 'mobile=?', 'phone=?'];
    const updateValues = [nom, prenom, mobile || '', phone || ''];

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.push('password=?');
      updateValues.push(hashed);
    }

    if (reqUsername) {
      // ensure unique username (exclude current person)
      const [exists] = await pool.query('SELECT idPers FROM Personne WHERE username = ? AND idPers <> ? LIMIT 1', [reqUsername, idPers]);
      if (exists.length) return res.status(400).json({ error: 'Nom d\'utilisateur déjà utilisé' });
      updateFields.push('username=?');
      updateValues.push(reqUsername);
    }

    // Handle isUser flag: if explicitly set to false, clear username/password
    if (isUser === false) {
      updateFields.push('username=?');
      updateValues.push(null);
      updateFields.push('password=?');
      updateValues.push(null);
    }

    updateValues.push(idPers);

    await pool.query(`UPDATE Personne SET ${updateFields.join(',')} WHERE idPers=?`, updateValues);

    // Synchronize ParentEleve links when matricules provided (array) or single matricule
    if (matricules !== undefined || matricule !== undefined) {
      const children = Array.isArray(matricules) ? matricules : (matricule ? [matricule] : []);
      // Remove existing links
      await pool.query('DELETE FROM ParentEleve WHERE idPers = ?', [idPers]);
      // Insert new links
      for (const m of children) {
        if (!m) continue;
        const [eleve] = await pool.query('SELECT matricule FROM Eleve WHERE matricule = ?', [m]);
        if (!eleve.length) return res.status(400).json({ error: `Élève non trouvé: ${m}` });
        await pool.query('INSERT INTO ParentEleve (idPers, matricule) VALUES (?, ?)', [idPers, m]);
      }
    }
    
    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      WHERE pr.idParent = ?`, [req.params.id]);
    
    const [children] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.photoURL, e.dateNaissance,
        s.libelle AS salle, s.idSalle, c.libelle AS classe, c.idClasse, cy.libelle AS cycle
      FROM ParentEleve pe
      JOIN Eleve e ON e.matricule = pe.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pe.idPers = ?
      ORDER BY e.nom, e.prenom`, [parent[0].idPers]);
    
    res.json({ ...rows[0], children, nbEnfants: children.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteParent = async (req, res) => {
  try {
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    
    // Delete parent-eleve links first
    await pool.query('DELETE FROM ParentEleve WHERE idPers = ?', [parent[0].idPers]);
    
    // Delete parent record
    await pool.query('DELETE FROM Parents WHERE idParent = ?', [req.params.id]);
    
    // Delete person record
    await pool.query('DELETE FROM Personne WHERE idPers = ?', [parent[0].idPers]);
    
    res.json({ message: 'Parent supprimé' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deactivateParent = async (req, res) => {
  try {
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    await pool.query('UPDATE Parents SET isDelete = 1 WHERE idParent = ?', [req.params.id]);
    await pool.query('UPDATE Personne SET isDelete = 1 WHERE idPers = ?', [parent[0].idPers]);
    res.json({ message: 'Parent désactivé', idParent: Number(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reactivateParent = async (req, res) => {
  try {
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    await pool.query('UPDATE Parents SET isDelete = 0 WHERE idParent = ?', [req.params.id]);
    await pool.query('UPDATE Personne SET isDelete = 0 WHERE idPers = ?', [parent[0].idPers]);
    res.json({ message: 'Parent réactivé', idParent: Number(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchEleves = async (req, res) => {
  try {
    const q = req.query.q || '';
    const [rows] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, s.libelle AS salle
      FROM Eleve e
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      WHERE e.actif = 1 AND (e.nom LIKE ? OR e.prenom LIKE ? OR e.matricule LIKE ?)
      LIMIT 20`, [`%${q}%`, `%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
