const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscriptionController');
const auth = require('../middleware/auth');
const verifyParent = require('../middleware/verifyParent');

router.get('/', auth, inscriptionController.getInscriptions);
router.get('/:id', auth, inscriptionController.getInscriptionById);
router.get('/eleve/:matricule', auth, verifyParent, inscriptionController.getInscriptionsByEleve);
router.post('/', auth, inscriptionController.createInscription);
router.put('/:id', auth, inscriptionController.updateInscription);
router.delete('/:id', auth, inscriptionController.deleteInscription);

module.exports = router;
