const express = require('express');
const c = require('../controllers/enseignantController');
const auth = require('../middleware/auth');
const { verifyAdmin, verifyEnseignant } = auth;
const router = express.Router();

router.get('/', verifyAdmin, c.getEnseignants);
router.get('/me', verifyEnseignant, c.getCurrentEnseignant);
router.get('/:id', auth, c.getEnseignantById);
router.post('/', verifyAdmin, c.createEnseignant);
router.put('/:id', verifyAdmin, c.updateEnseignant);
router.delete('/:id', verifyAdmin, c.deleteEnseignant);
router.post('/:id/affecter', verifyAdmin, c.affecterEnseignant);
router.post('/:id/rapport', verifyAdmin, c.createRapportEnseignant);
router.post('/:id/reactiver', verifyAdmin, c.reactivateEnseignant);

module.exports = router;
