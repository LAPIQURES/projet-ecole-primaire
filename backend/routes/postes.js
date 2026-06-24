const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/posteController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', ctrl.listPostes);
router.post('/', verifyAdmin, ctrl.createPoste);
router.put('/:id', verifyAdmin, ctrl.updatePoste);
router.delete('/:id', verifyAdmin, ctrl.deletePoste);

module.exports = router;
