const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect, authorize('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/organizations', adminController.getAllOrganizations);
router.patch('/organizations/:id/status', adminController.updateOrgStatus);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/security-analytics', adminController.getSecurityAnalytics);

module.exports = router;
