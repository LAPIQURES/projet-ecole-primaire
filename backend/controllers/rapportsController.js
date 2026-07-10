const pool = require('../database/db');
const socketHelper = require('../socket');

exports.getRapportsEleves = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.idRap, r.libelle, r.points, r.commentaire, r.matricule, r.event_date, r.created_at, r.idDiscipline, r.idAca,
        a.libelle AS annee, e.nom, e.prenom
      FROM Rapport r
      LEFT JOIN AnneeAcademique a ON a.idAnnee = r.idAca
      LEFT JOIN Eleve e ON e.matricule = r.matricule
      WHERE COALESCE(r.isDelete, 0) = 0
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
    const { matricule, commentaire, points, idAca, event_date, libelle } = req.body;
    if (!matricule || !commentaire) return res.status(400).json({ error: 'Matricule et commentaire requis' });
    
    // Si pas d'idAca, récupérer le plus récent
    let finalIdAca = idAca;
    if (!finalIdAca) {
      const [annees] = await pool.query('SELECT idAnnee FROM AnneeAcademique ORDER BY created_at DESC LIMIT 1');
      finalIdAca = annees[0]?.idAnnee || 1;
    }
    
    const idPers = req.user?.id || null; // null utilise la valeur par défaut (0)
    const [result] = await pool.query('INSERT INTO Rapport (libelle, matricule, commentaire, points, idAca, event_date, idPers, created_at) VALUES (?, ?, ?, ?, ?, COALESCE(?, NOW()), ?, NOW())', [libelle || 'Rapport', matricule, commentaire, points || 0, finalIdAca, event_date || null, idPers || null]);
    const [rows] = await pool.query('SELECT * FROM Rapport WHERE idRap = ?', [result.insertId]);
    try { const io = socketHelper.get(); io.to(`student-${matricule}`).emit('rapport:created', rows[0]); } catch (e) {}
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getRapportsEnseignants = async (req, res) => {
  try {
    // Retourner les rapports d'élèves avec infos enseignant
    const [rows] = await pool.query(`
      SELECT r.idRap, r.libelle, r.points, r.commentaire, r.matricule, r.idAca, r.event_date, r.created_at,
        CONCAT(e.prenom, ' ', e.nom) AS eleveNom,
        p.nom AS enseignantNom, p.prenom AS enseignantPrenom
      FROM Rapport r
      LEFT JOIN Eleve e ON e.matricule = r.matricule
      LEFT JOIN Personne p ON p.idPers = r.idPers
      WHERE r.idPers IS NOT NULL AND COALESCE(r.isDelete, 0) = 0
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
