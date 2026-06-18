const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const emploiController = require('../controllers/emploiController');

router.use(auth);

router.get('/', emploiController.list);
router.post('/', emploiController.create);
router.put('/:id', emploiController.update);
router.delete('/:id', emploiController.delete);

module.exports = router;
