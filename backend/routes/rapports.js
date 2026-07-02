const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rapportsController');

const router = express.Router();

router.get('/eleves', auth, ctrl.getRapportsEleves);
router.post('/eleves', auth, ctrl.createRapportEleve);
router.post('/eleves/create', auth, ctrl.createRapportEleve);
router.delete('/eleves/:id', auth, ctrl.deleteRapportEleve);

router.get('/enseignants', auth, ctrl.getRapportsEnseignants);
router.delete('/enseignants/:id', auth, ctrl.deleteRapportEnseignant);

module.exports = router;
