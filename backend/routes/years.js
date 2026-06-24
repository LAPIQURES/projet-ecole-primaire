const express = require('express');
const router = express.Router();
const yearController = require('../controllers/yearController');
const auth = require('../middleware/auth');

// Endpoint public pour les années et trimestres (pour les formulaires)
router.get('/', async (req, res) => {
  try {
    const pool = require('../database/db');
    
    // Récupérer les années
    const [annees] = await pool.query(`
      SELECT idAnnee, libelle, periode, created_at
      FROM AnneeAcademique
      ORDER BY idAnnee DESC
      LIMIT 10
    `);

    // Récupérer les trimestres
    const [trimestres] = await pool.query(`
      SELECT idTrimes, libelle, periode, idAca
      FROM Trimestre
      ORDER BY idTrimes DESC
      LIMIT 20
    `);

    res.json({ 
      annees: annees || [], 
      trimestres: trimestres || []
    });
  } catch (error) {
    console.error('Error fetching years/trimestres:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Routes pour Années
router.get('/annees', auth, yearController.getAnnees);
router.get('/annees/:id', auth, yearController.getAnneeById);
router.post('/annees', auth, yearController.createAnnee);
router.put('/annees/:id', auth, yearController.updateAnnee);
router.delete('/annees/:id', auth, yearController.deleteAnnee);

// Routes pour Trimestres
router.get('/trimestres', auth, yearController.getTrimestres);
router.get('/trimestres/:id', auth, yearController.getTrimestresById);
router.post('/trimestres', auth, yearController.createTrimestre);
router.put('/trimestres/:id', auth, yearController.updateTrimestre);
router.delete('/trimestres/:id', auth, yearController.deleteTrimestre);

module.exports = router;
