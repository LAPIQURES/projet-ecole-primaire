const pool = require('../database/db');
const socketHelper = require('../socket');

exports.getRapportsEleves = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.idRap, r.libelle, r.points, r.matricule, r.commentaire, r.event_date, r.created_at,
        a.libelle AS annee
      FROM Rapport r
      LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
      ORDER BY r.event_date DESC, r.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRapportEleve = async (req, res) => {
  try {
    await pool.query('DELETE FROM Rapport WHERE idRap = ?', [req.params.id]);
    res.json({ message: 'Rapport élève supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createRapportEleve = async (req, res) => {
  try {
    const { matricule, libelle, points, commentaire, idAca } = req.body;
    if (!matricule || !libelle) return res.status(400).json({ error: 'Matricule et libelle requis' });
    const [result] = await pool.query('INSERT INTO Rapport (libelle, points, matricule, commentaire, idAca, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [libelle, points || 0, matricule, commentaire || '', idAca || null]);
    const [rows] = await pool.query('SELECT * FROM Rapport WHERE idRap = ?', [result.insertId]);
    try { const io = socketHelper.get(); io.to(`student-${matricule}`).emit('rapport:created', rows[0]); } catch (e) {}
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRapportsEnseignants = async (req, res) => {
  try {
    // Rapports table created by enseignantController may have different structure
    const [rows] = await pool.query(`
      SELECT r.id, r.reference, r.categorie, r.idEnseignant, r.titre, r.details, r.created_at
      FROM Rapports r
      ORDER BY r.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRapportEnseignant = async (req, res) => {
  try {
    await pool.query('DELETE FROM Rapports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Rapport enseignant supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
