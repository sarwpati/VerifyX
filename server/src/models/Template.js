const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    layout: {
      theme: { type: String, enum: ['classic-gold', 'modern-emerald', 'royal-navy', 'crimson-honor', 'cyber-slate'], default: 'modern-emerald' },
      primaryColor: { type: String, default: '#059669' },
      accentColor: { type: String, default: '#fbbf24' },
      backgroundColor: { type: String, default: '#ffffff' },
      borderStyle: { type: String, enum: ['double-gold', 'ornate-guilloche', 'minimal-modern', 'geometric'], default: 'ornate-guilloche' },
      fontFamily: { type: String, enum: ['serif', 'sans', 'cinzel'], default: 'serif' },
      watermarkText: { type: String, default: 'VERIFIED CREDENTIAL' },
      showSecurityBadge: { type: Boolean, default: true },
      showMicroPattern: { type: Boolean, default: true },
      bannerImageUrl: { type: String, default: '' },
    },
    signatories: [
      {
        name: { type: String, default: 'Authorized Official' },
        title: { type: String, default: 'Controller of Examinations' },
        signatureUrl: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
