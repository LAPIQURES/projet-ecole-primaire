const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

// Director endpoints (protected to directeur/admin/superadmin)
router.get('/directeur', verifyAdmin(['directeur','admin','superadmin']), statsController.getDashboardStats);

// Intendant endpoints (financial) - allow intendant/admin/superadmin
router.get('/intendant', verifyAdmin(['intendant','admin','superadmin']), statsController.getIntendantDashboard);
router.get('/paiements-mensuel', verifyAdmin(['intendant','admin','superadmin']), statsController.getPaiementsMensuel);
router.get('/inscriptions-mensuel', verifyAdmin(['admin','superadmin']), statsController.getInscriptionsMensuel);

// Generic dashboard (optional token)
router.get('/dashboard', verifyToken, statsController.getDashboardStats);

module.exports = router;
