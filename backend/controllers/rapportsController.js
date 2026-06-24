const pool = require('../database/db');
const socketHelper = require('../socket');

exports.getRapportsEleves = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.idRap, r.commentaire, r.matricule, r.event_date, r.created_at, r.idDiscipline,
        a.libelle AS annee, e.nom, e.prenom
      FROM Rapport r
      LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
      LEFT JOIN Eleve e ON e.matricule = r.matricule
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
    const { matricule, commentaire, points, idAca, event_date } = req.body;
    if (!matricule || !commentaire) return res.status(400).json({ error: 'Matricule et commentaire requis' });
    const [result] = await pool.query('INSERT INTO Rapport (matricule, commentaire, points, idAca, event_date, created_at) VALUES (?, ?, ?, ?, COALESCE(?, NOW()), NOW())', [matricule, commentaire, points || 0, idAca || null, event_date || null]);
    const [rows] = await pool.query('SELECT * FROM Rapport WHERE idRap = ?', [result.insertId]);
    try { const io = socketHelper.get(); io.to(`student-${matricule}`).emit('rapport:created', rows[0]); } catch (e) {}
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRapportsEnseignants = async (req, res) => {
  try {
    // Retourner les rapports d'élèves avec infos enseignant
    const [rows] = await pool.query(`
      SELECT r.idRap, r.commentaire, r.matricule, r.idAca, r.event_date, r.created_at,
        CONCAT(e.prenom, ' ', e.nom) AS eleveNom,
        p.nom AS enseignantNom, p.prenom AS enseignantPrenom
      FROM Rapport r
      LEFT JOIN Eleve e ON e.matricule = r.matricule
      LEFT JOIN Personne p ON p.idPers = r.idPers
      WHERE r.idPers IS NOT NULL
      ORDER BY r.created_at DESC LIMIT 500
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteRapportEnseignant = async (req, res) => {
  try {
    await pool.query('DELETE FROM Rapport WHERE idRap = ?', [req.params.id]);
    res.json({ message: 'Rapport supprimé' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
