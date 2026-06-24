const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fonctionController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', ctrl.listFonctions);
router.post('/', verifyAdmin, ctrl.createFonction);
router.put('/:id', verifyAdmin, ctrl.updateFonction);
router.delete('/:id', verifyAdmin, ctrl.deleteFonction);

module.exports = router;
