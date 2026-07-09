const express = require('express');
const router = express.Router();
const inscriptionController = require('../controllers/inscriptionController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const verifyParent = require('../middleware/verifyParent');

router.get('/', verifyToken, inscriptionController.getInscriptions);
router.get('/:id', verifyToken, inscriptionController.getInscriptionById);
router.get('/eleve/:matricule', verifyToken, verifyParent, inscriptionController.getInscriptionsByEleve);
router.post('/', verifyToken, inscriptionController.createInscription);
router.put('/:id', verifyToken, inscriptionController.updateInscription);
router.delete('/:id', verifyToken, inscriptionController.deleteInscription);

module.exports = router;
