const pool = require('../database/db');

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
    const { nom, prenom, mobile, phone, matricule, password } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis' });
    
    // Validate password if provided
    const finalPassword = password || '1234'; // Default fallback password
    if (!password) {
      console.warn(`⚠️ Parent ${nom} ${prenom} created without password, using default: 1234`);
    }
    
    const idAdmin = req.user?.id || 1000;
    const idPers = await getNextIdPers();

    // Insert parent person record
    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, typePersonne, dateNaissance, lieuNaissance, username, password, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, 3, '2000-01-01', '', '', ?, ?, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', finalPassword, idAdmin]
    );

    const [result] = await pool.query(
      `INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, ?, NOW())`,
      [idPers, matricule || null, idAdmin]
    );

    // If matricule provided, create parent-eleve link
    if (matricule) {
      const [eleve] = await pool.query('SELECT matricule FROM Eleve WHERE matricule = ?', [matricule]);
      if (!eleve.length) return res.status(400).json({ error: 'Élève non trouvé' });
      await pool.query(
        'INSERT INTO ParentEleve (idPers, matricule) VALUES (?, ?)',
        [idPers, matricule]
      );
    }

    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.idPers, p.nom, p.prenom, p.mobile, p.phone
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      WHERE pr.idParent = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('createParent error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, matricule, password } = req.body;
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    
    // Update personal info including password if provided
    const updateFields = ['nom=?', 'prenom=?', 'mobile=?', 'phone=?'];
    const updateValues = [nom, prenom, mobile || '', phone || ''];
    
    if (password) {
      updateFields.push('password=?');
      updateValues.push(password);
    }
    
    updateValues.push(parent[0].idPers);
    
    await pool.query(`UPDATE Personne SET ${updateFields.join(',')} WHERE idPers=?`, updateValues);

    if (matricule !== undefined) {
      await pool.query('UPDATE Parents SET matricule = ? WHERE idParent = ?', [matricule || null, req.params.id]);
    }
    
    // Handle matricule - add/update parent-eleve link
    if (matricule !== undefined && matricule) {
      const [eleve] = await pool.query('SELECT matricule FROM Eleve WHERE matricule = ?', [matricule]);
      if (!eleve.length) return res.status(400).json({ error: 'Élève non trouvé' });
      
      const [existing] = await pool.query(
        'SELECT * FROM ParentEleve WHERE idPers = ? AND matricule = ?',
        [parent[0].idPers, matricule]
      );
      
      if (!existing.length) {
        await pool.query(
          'INSERT INTO ParentEleve (idPers, matricule) VALUES (?, ?)',
          [parent[0].idPers, matricule]
        );
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
