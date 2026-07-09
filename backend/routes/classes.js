const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classController');
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');

router.get('/cycles', verifyToken, ctrl.getCycles);
router.get('/', verifyToken, ctrl.getClasses);
router.get('/:id', verifyToken, ctrl.getClassById);
router.post('/', verifyToken, ctrl.createClass);
router.put('/:id', verifyToken, ctrl.updateClass);
router.delete('/:id', verifyToken, ctrl.deleteClass);
router.post('/:id/salles', verifyToken, ctrl.addSalleToClasse);

module.exports = router;
