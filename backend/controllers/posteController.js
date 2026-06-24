const pool = require('../database/db');

exports.listPostes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Poste ORDER BY libelle');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPoste = async (req, res) => {
  try {
    const { libelle, description } = req.body;
    if (!libelle) return res.status(400).json({ error: 'libelle requis' });
    const [result] = await pool.query('INSERT INTO Poste (libelle, description, created_at) VALUES (?, ?, NOW())', [libelle, description || null]);
    const [rows] = await pool.query('SELECT * FROM Poste WHERE idPoste = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updatePoste = async (req, res) => {
  try {
    const { id } = req.params;
    const { libelle, description } = req.body;
    await pool.query('UPDATE Poste SET libelle = ?, description = ? WHERE idPoste = ?', [libelle, description || null, id]);
    const [rows] = await pool.query('SELECT * FROM Poste WHERE idPoste = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletePoste = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Poste WHERE idPoste = ?', [id]);
    res.json({ message: 'Poste supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
