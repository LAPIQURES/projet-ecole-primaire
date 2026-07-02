const pool = require('../database/db');

// Ensure 'capacite' column exists on Salle (safe to run multiple times)
(async function ensureSalleCapacite() {
  try {
    await pool.query(`ALTER TABLE Salle ADD COLUMN capacite INT NULL`);
  } catch (err) {
    // ignore errors (column may already exist)
  }
})();

exports.getClasses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cl.idClasse, cl.libelle, cl.created_at,
        cy.libelle AS cycle, cy.idCycle,
        COUNT(DISTINCT s.idSalle) AS nbSalles,
        COUNT(DISTINCT f.matricule) AS nbEleves,
        COALESCE(SUM(s.capacite),0) AS capaciteMax
      FROM Classe cl
      LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle
      LEFT JOIN Salle s ON s.idClasse = cl.idClasse
      LEFT JOIN Frequente f ON f.idSalle = s.idSalle
      GROUP BY cl.idClasse, cl.libelle, cl.created_at, cy.libelle, cy.idCycle
      ORDER BY cl.libelle ASC`);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getClassById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Classe non trouvee' });

    const [salles] = await pool.query(`
      SELECT s.*, COUNT(f.matricule) AS nbEleves, s.capacite
      FROM Salle s LEFT JOIN Frequente f ON f.idSalle = s.idSalle
      WHERE s.idClasse = ? GROUP BY s.idSalle`, [req.params.id]);

    const [eleves] = await pool.query(`
      SELECT e.matricule, e.nom, e.prenom, e.sexe, e.actif, s.libelle AS salle
      FROM Eleve e
      JOIN Frequente f ON f.matricule = e.matricule
      JOIN Salle s ON s.idSalle = f.idSalle
      WHERE s.idClasse = ?`, [req.params.id]);

    res.json({ ...rows[0], salles, eleves });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const { libelle, idCycle } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libelle requis' });
    if (!idCycle) return res.status(400).json({ error: 'Veuillez sélectionner un cycle' });
    const idAdmin = req.user?.id || 1000;
    const [result] = await pool.query(
      `INSERT INTO Classe (libelle, idCycle, idAdmin, created_at) VALUES (?, ?, ?, NOW())`,
      [libelle, idCycle, idAdmin]);
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`,
      [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const { libelle, idCycle } = req.body;
    if (!idCycle) return res.status(400).json({ error: 'Veuillez sélectionner un cycle' });
    await pool.query(`UPDATE Classe SET libelle=?, idCycle=? WHERE idClasse=?`, [libelle, idCycle, req.params.id]);
    const [rows] = await pool.query(
      `SELECT cl.*, cy.libelle AS cycle FROM Classe cl LEFT JOIN Cycle cy ON cy.idCycle = cl.idCycle WHERE cl.idClasse = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Classe non trouvee' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    await pool.query('DELETE FROM Classe WHERE idClasse = ?', [req.params.id]);
    res.json({ message: 'Classe supprimee' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCycles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Cycle ORDER BY libelle');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addSalleToClasse = async (req, res) => {
  try {
    const { libelle, position, surface, capacite } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libellé requis' });
    const idAdmin = req.user?.id || 1000;
    const [result] = await pool.query(
      `INSERT INTO Salle (libelle, position, surface, capacite, idClasse, actif, idAdmin, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
      [libelle, position || '', surface || '', capacite || null, req.params.id, idAdmin]);
    const [rows] = await pool.query(
      `SELECT s.*, c.libelle AS classe FROM Salle s LEFT JOIN Classe c ON c.idClasse = s.idClasse WHERE s.idSalle = ?`,
      [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
