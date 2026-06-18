const pool = require('../database/db');

exports.getSalles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.libelle AS classe, cy.libelle AS cycle
      FROM Salle s
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      ORDER BY s.libelle
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT s.*, c.libelle AS classe, cy.libelle AS cycle
      FROM Salle s
      LEFT JOIN Classe c ON c.idClasse = s.idClasse
      LEFT JOIN Cycle cy ON cy.idCycle = c.idCycle
      WHERE s.idSalle = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSalle = async (req, res) => {
  try {
    const { libelle, position, surface, idClasse, capacite } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libellé requis' });
    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO Salle (libelle, position, surface, capacite, idClasse, actif, idAdmin, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
      [libelle, position || '', surface || '', capacite || null, idClasse || null, idAdmin]
    );
    const [rows] = await pool.query(`SELECT s.*, c.libelle AS classe FROM Salle s LEFT JOIN Classe c ON c.idClasse = s.idClasse WHERE s.idSalle = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, position, surface, idClasse, actif, capacite } = req.body;
    await pool.query(
      `UPDATE Salle SET libelle=?, position=?, surface=?, capacite=?, idClasse=?, actif=? WHERE idSalle=?`,
      [libelle, position || '', surface || '', capacite || null, idClasse || null, actif !== undefined ? actif : 1, id]
    );
    const [rows] = await pool.query(`SELECT s.*, c.libelle AS classe FROM Salle s LEFT JOIN Classe c ON c.idClasse = s.idClasse WHERE s.idSalle = ?`, [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSalle = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE Salle SET actif = 0 WHERE idSalle = ?', [id]);
    res.json({ message: 'Salle désactivée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
