const express = require('express');
const router = express.Router();
const trancheController = require('../controllers/tranchemController');
const auth = require('../middleware/auth');

router.get('/', auth, trancheController.getTranches);
router.post('/', auth, trancheController.createTranche);
router.put('/:id', auth, trancheController.updateTranche);
router.delete('/:id', auth, trancheController.deleteTranche);
router.get('/par-cycle', auth, trancheController.getTranchesParCycle);

module.exports = router;
