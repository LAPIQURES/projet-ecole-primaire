const express = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rapportsController');

const router = express.Router();
const verifyParent = require('../middleware/verifyParent');

router.get('/eleves', auth, verifyParent, ctrl.getRapportsEleves);
router.post('/eleves', auth, verifyParent, ctrl.createRapportEleve);
router.delete('/eleves/:id', auth, ctrl.deleteRapportEleve);

router.get('/enseignants', auth, ctrl.getRapportsEnseignants);
router.delete('/enseignants/:id', auth, ctrl.deleteRapportEnseignant);

module.exports = router;
