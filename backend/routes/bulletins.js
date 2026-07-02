const express = require('express');
const router = express.Router();
const bulletinController = require('../controllers/bulletinController');
const { verifyAdmin } = require('../middleware/auth');

// Créer un bulletin
router.post('/create', verifyAdmin, bulletinController.createBulletin);

// Récupérer les bulletins d'un élève
router.get('/eleve/:matricule', bulletinController.getBulletinsEleve);

// Récupérer les détails d'un bulletin
router.get('/:id', bulletinController.getBulletinDetail);

// Mettre à jour un bulletin
router.put('/:id', verifyAdmin, bulletinController.updateBulletin);

// Finaliser/Publier un bulletin
router.post('/:id/publish', verifyAdmin, bulletinController.publishBulletin);

// Supprimer un bulletin
router.delete('/:id', verifyAdmin, bulletinController.deleteBulletin);

module.exports = router;
