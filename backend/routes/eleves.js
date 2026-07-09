const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eleveController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

// Allow anonymous viewing of élèves list; auth optional
router.get('/', optionalAuth, ctrl.getEleves);
router.get('/:id', verifyToken, ctrl.getEleveById);
router.post('/', verifyAdmin(), ctrl.createEleve);
router.put('/:id', verifyAdmin(), ctrl.updateEleve);
router.put('/:id/activate', verifyAdmin(), ctrl.activateEleve);
router.delete('/:id', verifyAdmin(), ctrl.deleteEleve);
router.post('/:id/rapport', verifyToken, ctrl.createRapport);

// New endpoints for parents and attendance
router.get('/:matricule/parents', verifyToken, ctrl.getEleveParents);
router.get('/:matricule/attendance', verifyToken, ctrl.getEleveAttendance);
router.post('/mark-attendance', verifyToken, ctrl.markAttendance);

module.exports = router;
