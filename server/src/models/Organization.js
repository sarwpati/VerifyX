const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'suspended'],
      default: 'verified', // Auto-verify seeded/created orgs in demo mode
    },
    pki: {
      publicKey: { type: String, required: true },
      privateKeyEncrypted: { type: String, required: true },
      keyId: { type: String, required: true },
      algorithm: { type: String, default: 'Ed25519' },
      createdAt: { type: Date, default: Date.now },
      keyHistory: [
        {
          keyId: String,
          publicKey: String,
          rotatedAt: Date,
          reason: String,
        },
      ],
    },
    signerInfo: {
      signatoryName: { type: String, default: 'Authorized Signatory' },
      signatoryTitle: { type: String, default: 'Dean / Registrar' },
      signatureImageUrl: { type: String, default: '' },
    },
    stats: {
      issuedCount: { type: Number, default: 0 },
      verifiedCount: { type: Number, default: 0 },
      revokedCount: { type: Number, default: 0 },
    },
    verifiedAt: { type: Date, default: Date.now },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
