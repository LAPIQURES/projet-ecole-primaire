const express = require('express');
const router = express.Router();
const paramCtrl = require('../controllers/parametresController');
const auth = require('../middleware/auth');

router.get('/profile', auth, paramCtrl.getProfile);
router.put('/profile', auth, paramCtrl.updateProfile);
router.post('/password', auth, paramCtrl.changePassword);

// Payment modes
router.get('/payment-modes', auth, paramCtrl.getPaymentModes);
router.post('/payment-modes', auth, paramCtrl.createPaymentMode);
router.put('/payment-modes/:id', auth, paramCtrl.updatePaymentMode);
router.delete('/payment-modes/:id', auth, paramCtrl.deletePaymentMode);

module.exports = router;
