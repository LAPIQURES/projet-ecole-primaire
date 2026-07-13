const pool = require('../database/db');

exports.getSalles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.* FROM Salle s ORDER BY s.libelle
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
      SELECT s.* FROM Salle s WHERE s.idSalle = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSalle = async (req, res) => {
  try {
    const { libelle, position, surface, capacite } = req.body;
    if (!libelle) return res.status(400).json({ error: 'Libellé requis' });
    const idAdmin = req.user?.id || 1;
    const [result] = await pool.query(
      `INSERT INTO Salle (libelle, position, surface, capacite, actif, idAdmin, created_at) VALUES (?, ?, ?, ?, 1, ?, NOW())`,
      [libelle, position || '', surface || '', capacite || null, idAdmin]
    );
    const [rows] = await pool.query(`SELECT s.* FROM Salle s WHERE s.idSalle = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, position, surface, actif, capacite } = req.body;
    await pool.query(
      `UPDATE Salle SET libelle=?, position=?, surface=?, capacite=?, actif=? WHERE idSalle=?`,
      [libelle, position || '', surface || '', capacite || null, actif !== undefined ? actif : 1, id]
    );
    const [rows] = await pool.query(`SELECT s.* FROM Salle s WHERE s.idSalle = ?`, [id]);
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
