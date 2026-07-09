const express = require('express');
const c = require('../controllers/enseignantController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const pool = require('../database/db');
const router = express.Router();

const buildTeacherFilter = (req) => {
  const teacherId = req.user?.idEnseignant || req.user?.id || null;
  const teacherCourseId = req.user?.idCours || null;
  if (!teacherId) throw new Error('Teacher identifier missing');

  if (teacherCourseId) {
    return {
      clause: 'WHERE c.idEnseignant = ? OR c.idCours = ?',
      params: [teacherId, teacherCourseId]
    };
  }
  return {
    clause: 'WHERE c.idEnseignant = ?',
    params: [teacherId]
  };
};

router.get('/', verifyAdmin, c.getEnseignants);
router.get('/me', verifyEnseignant, c.getCurrentEnseignant);

// Endpoints enseignant filtrés
router.get('/me/courses', verifyEnseignant, async (req, res) => {
  try {
    const filter = buildTeacherFilter(req);
    const [courses] = await pool.query(
      `SELECT DISTINCT
        c.idCours, c.libelle AS libelleCours, c.heures,
        cl.idClasse, cl.libelle AS classe,
        s.idSalle, s.libelle AS libelleSalle,
        e.heure, e.jour,
        COALESCE(COUNT(DISTINCT f.matricule), 0) AS nbEleves
       FROM Cours c
       LEFT JOIN Classe cl ON cl.idClasse = c.idClasse
       LEFT JOIN Salle s ON s.idSalle = c.idSalle
       LEFT JOIN EmploiDuTemps e ON e.idCours = c.idCours
       LEFT JOIN Frequente f ON f.idSalle = s.idSalle
       ${filter.clause}
       GROUP BY c.idCours, cl.idClasse, s.idSalle, e.jour, e.heure
       ORDER BY cl.libelle, e.heure`,
      filter.params
    );
    res.json(courses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/schedule', verifyEnseignant, async (req, res) => {
  try {
    const filter = buildTeacherFilter(req);
    const [schedule] = await pool.query(
      `SELECT DISTINCT
        e.idTemps AS id,
        e.jour,
        e.heure,
        e.jour AS day,
        e.heure AS time,
        c.libelle AS libelleCours,
        s.libelle AS libelleSalle,
        cl.libelle AS classe
       FROM EmploiDuTemps e
       INNER JOIN Cours c ON c.idCours = e.idCours
       LEFT JOIN Salle s ON s.idSalle = e.idSalle
       LEFT JOIN Classe cl ON cl.idClasse = e.idClasse
       ${filter.clause}
       ORDER BY e.jour, e.heure`,
      filter.params
    );
    res.json(schedule || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/students', verifyEnseignant, async (req, res) => {
  try {
    const filter = buildTeacherFilter(req);
    const [students] = await pool.query(
      `SELECT DISTINCT
        e.matricule, e.nom, e.prenom,
        cl.idClasse, cl.libelle AS classe,
        s.idSalle, s.libelle AS libelleSalle
       FROM Eleve e
       INNER JOIN Frequente f ON f.matricule = e.matricule
       INNER JOIN Salle s ON s.idSalle = f.idSalle
       LEFT JOIN Classe cl ON cl.idClasse = s.idClasse
       WHERE s.idSalle IN (
         SELECT DISTINCT s2.idSalle
         FROM Cours c
         LEFT JOIN Salle s2 ON s2.idSalle = c.idSalle
         ${filter.clause}
       )
       ORDER BY cl.libelle, e.nom, e.prenom`,
      filter.params
    );
    res.json(students || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me/classes-salles', verifyEnseignant, async (req, res) => {
  try {
    const filter = buildTeacherFilter(req);
    const [classes] = await pool.query(
      `SELECT DISTINCT cl.idClasse, cl.libelle
       FROM Classe cl
       INNER JOIN Salle s ON s.idClasse = cl.idClasse
       INNER JOIN Cours c ON c.idSalle = s.idSalle
       ${filter.clause}
       ORDER BY cl.libelle`,
      filter.params
    );
    
    const [salles] = await pool.query(
      `SELECT DISTINCT s.idSalle, s.libelle AS libelleSalle
       FROM Salle s
       INNER JOIN Cours c ON c.idSalle = s.idSalle
       ${filter.clause}
       ORDER BY s.libelle`,
      filter.params
    );
    
    const [cours] = await pool.query(
      `SELECT DISTINCT c.idCours, c.libelle AS libelleCours
       FROM Cours c
       ${filter.clause}
       ORDER BY c.libelle`,
      filter.params
    );
    
    res.json({
      classes: classes.map((c) => ({ idClasse: c.idClasse, libelle: c.libelle })) || [],
      salles: salles || [],
      cours: cours || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, c.getEnseignantById);
router.post('/', verifyAdmin, c.createEnseignant);
router.put('/:id', verifyAdmin, c.updateEnseignant);
router.delete('/:id', verifyAdmin, c.deleteEnseignant);
router.post('/:id/affecter', verifyAdmin, c.affecterEnseignant);
router.post('/:id/rapport', verifyAdmin, c.createRapportEnseignant);
router.post('/:id/reactiver', verifyAdmin, c.reactivateEnseignant);

module.exports = router;
