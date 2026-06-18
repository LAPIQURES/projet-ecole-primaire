const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard', verifyToken, statsController.getDashboardStats);
router.get('/paiements-mensuel', verifyToken, statsController.getPaiementsMensuel);
router.get('/inscriptions-mensuel', verifyToken, statsController.getInscriptionsMensuel);

module.exports = router;
