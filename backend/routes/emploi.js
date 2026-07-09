const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin, verifyEnseignant, optionalAuth } = require('../middleware/auth');
const emploiController = require('../controllers/emploiController');

router.use(verifyToken);

router.get('/', emploiController.list);
router.post('/', emploiController.create);
router.put('/:id', emploiController.update);
router.delete('/:id', emploiController.delete);

module.exports = router;
