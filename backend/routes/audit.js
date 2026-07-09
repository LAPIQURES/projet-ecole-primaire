const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const auditController = require('../controllers/auditController');

router.use(verifyToken);

router.get('/', auditController.listLogs);

module.exports = router;
