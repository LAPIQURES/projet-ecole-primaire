const pool = require('../database/db');

exports.listFonctions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Fonction ORDER BY libelle');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createFonction = async (req, res) => {
  try {
    const { libelle, description } = req.body;
    if (!libelle) return res.status(400).json({ error: 'libelle requis' });
    const [result] = await pool.query('INSERT INTO Fonction (libelle, description, created_at) VALUES (?, ?, NOW())', [libelle, description || null]);
    const [rows] = await pool.query('SELECT * FROM Fonction WHERE idFonction = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateFonction = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, description } = req.body;
    await pool.query('UPDATE Fonction SET libelle = ?, description = ? WHERE idFonction = ?', [libelle, description || null, id]);
    const [rows] = await pool.query('SELECT * FROM Fonction WHERE idFonction = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteFonction = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Fonction WHERE idFonction = ?', [id]);
    res.json({ message: 'Fonction supprimée' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
