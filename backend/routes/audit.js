const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const auditController = require('../controllers/auditController');

router.use(auth);

router.get('/', auditController.listLogs);

module.exports = router;
