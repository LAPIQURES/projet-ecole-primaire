const express = require('express');
const router = express.Router();
const salleController = require('../controllers/salleController');
const auth = require('../middleware/auth');

router.get('/', auth, salleController.getSalles);
router.get('/:id', auth, salleController.getSalleById);
router.post('/', auth, salleController.createSalle);
router.put('/:id', auth, salleController.updateSalle);
router.delete('/:id', auth, salleController.deleteSalle);

module.exports = router;
