const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { uploadDisk } = require('../middleware/upload');

// Protected routes (Org / Admin)
router.post('/issue', protect, authorize('org'), certificateController.issueSingleCertificate);
router.post(
  '/batch-issue',
  protect,
  authorize('org'),
  uploadDisk.single('file'),
  certificateController.issueBatchCertificates
);
router.post('/revoke/:id', protect, authorize('org', 'admin'), certificateController.revokeCertificate);
router.get('/organization', protect, authorize('org'), certificateController.getOrgCertificates);
router.get('/:id', certificateController.getCertificateById);

module.exports = router;
