const express = require('express');
const router = express.Router();
const paramCtrl = require('../controllers/parametresController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

router.get('/profile', verifyToken, paramCtrl.getProfile);
router.put('/profile', verifyToken, paramCtrl.updateProfile);
router.post('/password', verifyToken, paramCtrl.changePassword);

// Payment modes
router.get('/payment-modes', verifyToken, paramCtrl.getPaymentModes);
router.post('/payment-modes', verifyToken, paramCtrl.createPaymentMode);
router.put('/payment-modes/:id', verifyToken, paramCtrl.updatePaymentMode);
router.delete('/payment-modes/:id', verifyToken, paramCtrl.deletePaymentMode);

module.exports = router;
