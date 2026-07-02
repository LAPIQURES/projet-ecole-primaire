const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const auth = require('../middleware/auth');

router.get('/bus', auth, busController.getBus);
router.post('/bus', auth, busController.createBus);
router.put('/bus/:id', auth, busController.updateBus);

router.get('/abonnements', auth, busController.getAbonnementsBus);
router.post('/abonnements', auth, busController.createAbonnementBus);
router.put('/abonnements/:id', auth, busController.updateAbonnementBus);
router.delete('/abonnements/:id', auth, busController.deleteAbonnementBus);

module.exports = router;
