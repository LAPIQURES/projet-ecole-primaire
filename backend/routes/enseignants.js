const express = require('express');
const c = require('../controllers/enseignantController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, c.getEnseignants);
router.get('/:id', auth, c.getEnseignantById);
router.post('/', auth, c.createEnseignant);
router.put('/:id', auth, c.updateEnseignant);
router.delete('/:id', auth, c.deleteEnseignant);
router.post('/:id/affecter', auth, c.affecterEnseignant);
router.post('/:id/rapport', auth, c.createRapportEnseignant);
router.post('/:id/reactiver', auth, c.reactivateEnseignant);

module.exports = router;
