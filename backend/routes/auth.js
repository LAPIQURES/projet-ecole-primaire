const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/me', auth, authController.me);

// Admin-only user management
router.post('/users/create', auth, authController.createUser);
router.get('/users', auth, authController.listUsers);
router.post('/users/toggle', auth, authController.toggleUser);
router.post('/users/reset-password', auth, authController.resetPassword);

module.exports = router;
