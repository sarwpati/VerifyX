const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    recipient: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true, index: true },
      rollNumber: { type: String, trim: true, default: '' },
      nationalId: { type: String, trim: true, default: '' },
      department: { type: String, trim: true, default: '' },
    },
    issuer: {
      orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
      orgName: { type: String, required: true },
      orgCode: { type: String, required: true },
      keyId: { type: String, required: true },
    },
    details: {
      title: { type: String, required: true, trim: true }, // e.g. "Bachelor of Technology in Computer Science"
      courseName: { type: String, trim: true, default: '' },
      major: { type: String, trim: true, default: '' },
      gradeOrScore: { type: String, trim: true, default: '' },
      issueDate: { type: Date, default: Date.now },
      expiryDate: { type: Date, default: null },
      description: { type: String, default: '' },
      customFields: { type: Map, of: String, default: {} },
    },
    crypto: {
      canonicalPayload: { type: Object, required: true },
      dataHash: { type: String, required: true, index: true }, // SHA-256 of canonical JSON
      signature: { type: String, required: true }, // Ed25519 signature base64
      publicKeyUsed: { type: String, required: true }, // PEM
      pdfHash: { type: String, default: '' }, // SHA-256 of generated PDF
      merkle: {
        isBatch: { type: Boolean, default: false },
        batchId: { type: String, default: null },
        root: { type: String, default: null },
        leafHash: { type: String, default: null },
        proof: [{ type: String }],
      },
    },
    status: {
      type: String,
      enum: ['valid', 'revoked', 'expired', 'suspended'],
      default: 'valid',
      index: true,
    },
    revocationDetails: {
      isRevoked: { type: Boolean, default: false },
      revokedAt: { type: Date, default: null },
      revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: '' },
      revocationHash: { type: String, default: '' },
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      default: null,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
