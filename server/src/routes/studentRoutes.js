const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public student wallet route (by identifier)
router.get('/wallet/:identifier', studentController.getPublicWallet);

// Protected student route (view own wallet)
router.get('/my-certificates', protect, authorize('student'), studentController.getMyCertificates);

module.exports = router;
