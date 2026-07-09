const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', verifyToken, authController.me);

module.exports = router;
