const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public verified orgs listing
router.get('/verified', orgController.getAllVerifiedOrgs);

// Protected Org routes
router.get('/profile', protect, authorize('org'), orgController.getProfile);
router.put('/profile', protect, authorize('org'), orgController.updateProfile);
router.post('/rotate-keys', protect, authorize('org'), orgController.rotateKeys);
router.get('/stats', protect, authorize('org'), orgController.getStats);

module.exports = router;
