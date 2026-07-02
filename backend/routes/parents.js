const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/parentController');
const auth = require('../middleware/auth');

router.get('/search', auth, ctrl.searchEleves);
router.get('/', auth, ctrl.getParents);
router.get('/:id', auth, ctrl.getParentById);
router.post('/', auth, ctrl.createParent);
router.put('/:id', auth, ctrl.updateParent);
router.put('/:id/deactivate', auth, ctrl.deactivateParent);
router.put('/:id/reactivate', auth, ctrl.reactivateParent);
router.delete('/:id', auth, ctrl.deleteParent);

module.exports = router;
