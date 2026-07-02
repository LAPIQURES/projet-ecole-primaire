const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eleveController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getEleves);
router.get('/:id', auth, ctrl.getEleveById);
router.post('/', auth, ctrl.createEleve);
router.put('/:id', auth, ctrl.updateEleve);
router.put('/:id/activate', auth, ctrl.activateEleve);
router.delete('/:id', auth, ctrl.deleteEleve);
router.post('/:id/rapport', auth, ctrl.createRapport);

module.exports = router;
