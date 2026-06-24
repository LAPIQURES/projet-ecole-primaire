const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/personnelController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/', verifyAdmin, ctrl.listPersonnel);
router.get('/:id', verifyAdmin, ctrl.getPersonnel);
router.post('/', verifyAdmin, ctrl.createPersonnel);
router.put('/:id', verifyAdmin, ctrl.updatePersonnel);
router.delete('/:id', verifyAdmin, ctrl.deletePersonnel);

module.exports = router;
