const pool = require('../database/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      [[eleves]],
      [[enseignants]],
      [[classes]],
      [[paiementsMois]],
      [[impayesCount]],
      [elevesRecents],
      [[capaciteMax]]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM Eleve'),
      pool.query('SELECT COUNT(*) as total FROM Enseignant'),
      pool.query('SELECT COUNT(*) as total FROM Classe'),
      pool.query('SELECT COALESCE(SUM(montant),0) as total FROM Paiement WHERE MONTH(datePaie) = MONTH(CURDATE()) AND YEAR(datePaie) = YEAR(CURDATE())'),
      pool.query('SELECT COUNT(DISTINCT e.matricule) as total FROM Eleve e LEFT JOIN Paiement p ON p.matricule = e.matricule WHERE e.actif = 1 AND p.idPaie IS NULL'),
      pool.query(`
        SELECT e.matricule, e.nom, e.prenom, e.created_at, e.photoURL, c.libelle as classe
        FROM Eleve e
        LEFT JOIN Frequente f ON f.matricule = e.matricule
        LEFT JOIN Salle s ON s.idSalle = f.idSalle
        LEFT JOIN Classe c ON c.idClasse = s.idClasse
        ORDER BY e.created_at DESC LIMIT 5
      `),
      pool.query('SELECT COALESCE(SUM(capacite),0) AS total FROM Salle')
    ]);

    res.json({
      stats: {
        totalEleves: eleves.total,
        totalEnseignants: enseignants.total,
        totalClasses: classes.total,
        paiementsMois: paiementsMois.total,
        impayesCount: impayesCount.total,
        capaciteMax: capaciteMax.total || 0,
      },
      elevesRecents,
    });
  } catch (error) {
    console.error('Erreur stats dashboard:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getPaiementsMensuel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(datePaie, '%Y-%m') as mois,
        SUM(montant) as total,
        COUNT(*) as nbPaiements
      FROM Paiement
      WHERE datePaie >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(datePaie, '%Y-%m')
      ORDER BY mois ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInscriptionsMensuel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS mois,
        COUNT(*) AS total
      FROM Eleve
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY mois ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
