const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classController');
const auth = require('../middleware/auth');

router.get('/cycles', auth, ctrl.getCycles);
router.get('/', auth, ctrl.getClasses);
router.get('/:id', auth, ctrl.getClassById);
router.post('/', auth, ctrl.createClass);
router.put('/:id', auth, ctrl.updateClass);
router.delete('/:id', auth, ctrl.deleteClass);
router.post('/:id/salles', auth, ctrl.addSalleToClasse);

module.exports = router;
