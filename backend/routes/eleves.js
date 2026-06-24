const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eleveController');
const auth = require('../middleware/auth');
const { verifyAdmin, verifyEnseignant, optionalAuth } = auth;

// Allow anonymous viewing of élèves list; auth optional
router.get('/', optionalAuth, ctrl.getEleves);
router.get('/:id', auth, ctrl.getEleveById);
router.post('/', verifyAdmin, ctrl.createEleve);
router.put('/:id', verifyAdmin, ctrl.updateEleve);
router.put('/:id/activate', verifyAdmin, ctrl.activateEleve);
router.delete('/:id', verifyAdmin, ctrl.deleteEleve);
router.post('/:id/rapport', auth, ctrl.createRapport);

// New endpoints for parents and attendance
router.get('/:matricule/parents', auth, ctrl.getEleveParents);
router.get('/:matricule/attendance', auth, ctrl.getEleveAttendance);
router.post('/mark-attendance', auth, ctrl.markAttendance);

module.exports = router;
