const pool = require('../database/db');

exports.listPersonnel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT per.*, p.nom, p.prenom, pst.libelle AS poste, fn.libelle AS fonction
      FROM Personnel per
      LEFT JOIN Personne p ON p.idPers = per.idPers
      LEFT JOIN Poste pst ON pst.idPoste = per.idPoste
      LEFT JOIN Fonction fn ON fn.idFonction = per.idFonction
      ORDER BY per.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM Personnel WHERE idPersonnel = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Personnel introuvable' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createPersonnel = async (req, res) => {
  try {
    const { idPers, idPoste, idFonction, dateDebut, dateFin } = req.body;
    if (!idPers) return res.status(400).json({ error: 'idPers requis' });
    const [result] = await pool.query('INSERT INTO Personnel (idPers, idPoste, idFonction, dateDebut, dateFin, actif, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())', [idPers, idPoste || null, idFonction || null, dateDebut || null, dateFin || null]);
    const [rows] = await pool.query('SELECT * FROM Personnel WHERE idPersonnel = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const { idPoste, idFonction, dateDebut, dateFin, actif } = req.body;
    await pool.query('UPDATE Personnel SET idPoste=?, idFonction=?, dateDebut=?, dateFin=?, actif=? WHERE idPersonnel = ?', [idPoste || null, idFonction || null, dateDebut || null, dateFin || null, actif !== undefined ? actif : 1, id]);
    const [rows] = await pool.query('SELECT * FROM Personnel WHERE idPersonnel = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Personnel WHERE idPersonnel = ?', [id]);
    res.json({ message: 'Personnel supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
