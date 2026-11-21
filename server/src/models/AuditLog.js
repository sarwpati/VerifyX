const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'CERTIFICATE_ISSUED',
        'BATCH_CERTIFICATES_ISSUED',
        'CERTIFICATE_REVOKED',
        'CERTIFICATE_VERIFIED_ONLINE',
        'CERTIFICATE_VERIFIED_PDF_TAMPER_CHECK',
        'TAMPER_ATTEMPT_DETECTED',
        'ORGANIZATION_VERIFIED',
        'ORGANIZATION_SUSPENDED',
        'KEY_ROTATED',
        'USER_LOGIN',
      ],
      index: true,
    },
    certificateId: {
      type: String,
      default: null,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'VerifyX-Client',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'WARNING', 'FAILURE', 'SECURITY_ALERT'],
      default: 'SUCCESS',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
