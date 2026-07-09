const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/parentController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

router.get('/search', verifyToken, ctrl.searchEleves);
router.get('/', verifyToken, ctrl.getParents);
router.get('/:id', verifyToken, ctrl.getParentById);
router.post('/', verifyToken, ctrl.createParent);
router.put('/:id', verifyToken, ctrl.updateParent);
router.put('/:id/deactivate', verifyToken, ctrl.deactivateParent);
router.put('/:id/reactivate', verifyToken, ctrl.reactivateParent);
router.delete('/:id', verifyToken, ctrl.deleteParent);

module.exports = router;
