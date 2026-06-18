const pool = require('../database/db');

async function getNextIdPers() {
  const [rows] = await pool.query('SELECT COALESCE(MAX(idPers), 0) + 1 AS nextId FROM Personne');
  return rows[0].nextId;
}

exports.getParents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.matricule,
        p.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif,
        e.nom AS eleveNom, e.prenom AS elevePrenom, e.matricule AS eleveMatricule,
        s.libelle AS eleveSalle,
        COUNT(DISTINCT pr2.matricule) AS nbEnfants
      FROM Parents pr
      JOIN Personne p ON p.idPers = pr.idPers
      LEFT JOIN Eleve e ON e.matricule = pr.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Parents pr2 ON pr2.idPers = pr.idPers
      GROUP BY pr.idParent, pr.matricule, p.idPers, p.nom, p.prenom, p.mobile, p.phone, e.nom, e.prenom, e.matricule, s.libelle
      ORDER BY p.nom, p.prenom`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getParentById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.matricule, p.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif,
        e.nom AS eleveNom, e.prenom AS elevePrenom, e.matricule AS eleveMatricule,
        s.libelle AS eleveSalle, c.libelle AS eleveClasse, cy.libelle AS eleveCycle
      FROM Parents pr JOIN Personne p ON p.idPers = pr.idPers
      LEFT JOIN Eleve e ON e.matricule = pr.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pr.idParent = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Parent non trouvé' });
    const parent = rows[0];
    const [children] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.photoURL,
        s.libelle AS salle, c.libelle AS classe, cy.libelle AS cycle
      FROM Parents pr
      JOIN Eleve e ON e.matricule = pr.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pr.idPers = ?
      ORDER BY e.nom, e.prenom`, [parent.idPers]);
    res.json({ ...parent, children, nbEnfants: children.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createParent = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, matricule } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis' });
    if (!matricule) return res.status(400).json({ error: 'Matricule de l’enfant requis' });
    const idAdmin = req.user?.id || 1000;
    const idPers = await getNextIdPers();

    const [duplicate] = await pool.query('SELECT idParent FROM Parents WHERE matricule = ? LIMIT 1', [matricule]);
    if (duplicate.length) return res.status(400).json({ error: 'Cet élève a déjà un parent enregistré' });

    // Insert with all required fields - dateNaissance and lieuNaissance as empty defaults
    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, typePersonne, dateNaissance, lieuNaissance, username, password, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, 3, '2000-01-01', '', '', '1234', ?, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', idAdmin]
    );

    const [result] = await pool.query(
      `INSERT INTO Parents (idPers, matricule, idAdmin, created_at) VALUES (?, ?, ?, NOW())`,
      [idPers, matricule || null, idAdmin]
    );

    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.matricule, p.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif,
        e.nom AS eleveNom, e.prenom AS elevePrenom
      FROM Parents pr JOIN Personne p ON p.idPers = pr.idPers
      LEFT JOIN Eleve e ON e.matricule = pr.matricule
      WHERE pr.idParent = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('createParent error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, matricule } = req.body;
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    await pool.query(`UPDATE Personne SET nom=?, prenom=?, mobile=?, phone=? WHERE idPers=?`,
      [nom, prenom, mobile || '', phone || '', parent[0].idPers]);
    if (matricule !== undefined) {
      const [duplicate] = await pool.query('SELECT idParent FROM Parents WHERE matricule = ? AND idParent <> ? LIMIT 1', [matricule, req.params.id]);
      if (duplicate.length) return res.status(400).json({ error: 'Cet élève a déjà un parent enregistré' });
      await pool.query('UPDATE Parents SET matricule=? WHERE idParent=?', [matricule || null, req.params.id]);
    }
    const [rows] = await pool.query(`
      SELECT pr.idParent, pr.matricule, p.idPers, p.nom, p.prenom, p.mobile, p.phone,
        CASE WHEN COALESCE(pr.isDelete, 0) = 1 OR COALESCE(p.isDelete, 0) = 1 THEN 0 ELSE 1 END AS actif,
        e.nom AS eleveNom, e.prenom AS elevePrenom, e.matricule AS eleveMatricule,
        s.libelle AS eleveSalle, c.libelle AS eleveClasse, cy.libelle AS eleveCycle
      FROM Parents pr JOIN Personne p ON p.idPers = pr.idPers
      LEFT JOIN Eleve e ON e.matricule = pr.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pr.idParent = ?`, [req.params.id]);
    const [children] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.photoURL,
        s.libelle AS salle, c.libelle AS classe, cy.libelle AS cycle
      FROM Parents pr
      JOIN Eleve e ON e.matricule = pr.matricule
      LEFT JOIN Frequente f ON f.matricule = e.matricule
      LEFT JOIN Salle s ON s.idSalle = f.idSalle
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE pr.idPers = ?
      ORDER BY e.nom, e.prenom`, [rows[0].idPers]);
    res.json({ ...rows[0], children, nbEnfants: children.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteParent = async (req, res) => {
  try {
    const [parent] = await pool.query('SELECT idPers FROM Parents WHERE idParent = ?', [req.params.id]);
    if (!parent.length) return res.status(404).json({ error: 'Parent non trouvé' });
    await pool.query('DELETE FROM Parents WHERE idParent = ?', [req.params.id]);
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
