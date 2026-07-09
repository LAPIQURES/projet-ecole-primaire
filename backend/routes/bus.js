const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

router.get('/bus', verifyToken, busController.getBus);
router.post('/bus', verifyToken, busController.createBus);
router.put('/bus/:id', verifyToken, busController.updateBus);

router.get('/abonnements', verifyToken, busController.getAbonnementsBus);
router.post('/abonnements', verifyToken, busController.createAbonnementBus);
router.put('/abonnements/:id', verifyToken, busController.updateAbonnementBus);
router.delete('/abonnements/:id', verifyToken, busController.deleteAbonnementBus);

module.exports = router;
