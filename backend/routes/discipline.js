const express = require('express');
const router = express.Router();
const disciplineController = require('../controllers/disciplineController');
const { verifyAdmin } = require('../middleware/auth');

// Récupérer tous les problèmes de discipline
router.get('/', disciplineController.getDisciplineSummary);

// Enregistrer un problème de discipline
router.post('/create', verifyAdmin, disciplineController.createDisciplineLog);

// Récupérer les problèmes de discipline d'un élève
router.get('/eleve/:matricule', disciplineController.getDisciplineEleve);

// Récupérer le résumé de discipline (classe/année)
router.get('/summary', disciplineController.getDisciplineSummary);

// Récupérer statistiques de discipline
router.get('/stats', disciplineController.getDisciplineStats);

// Get absence data for admin dashboard
router.get('/absences/list', verifyAdmin, disciplineController.getAbsenceData);

// Mettre à jour un problème de discipline
router.put('/:id', verifyAdmin, disciplineController.updateDisciplineLog);

// Supprimer un problème de discipline
router.delete('/:id', verifyAdmin, disciplineController.deleteDisciplineLog);

module.exports = router;
