const Organization = require('../models/Organization');
const Certificate = require('../models/Certificate');
const { generateOrgKeyPair } = require('../crypto/pkiEngine');
const { logSecurityEvent } = require('../services/auditService');

/**
 * Get organization profile and public keys
 */
exports.getProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // Do not return encrypted private key in public profile responses
    const orgObj = org.toObject();
    delete orgObj.pki.privateKeyEncrypted;

    res.json({
      success: true,
      organization: orgObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update organization profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, website, description, logoUrl, signerInfo } = req.body;

    const org = await Organization.findById(req.user.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    if (name) org.name = name;
    if (website !== undefined) org.website = website;
    if (description !== undefined) org.description = description;
    if (logoUrl !== undefined) org.logoUrl = logoUrl;
    if (signerInfo) {
      org.signerInfo = {
        ...org.signerInfo,
        ...signerInfo,
      };
    }

    await org.save();

    const orgObj = org.toObject();
    delete orgObj.pki.privateKeyEncrypted;

    res.json({
      success: true,
      organization: orgObj,
      message: 'Organization profile updated successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Rotate Ed25519 PKI Cryptographic Keys
 */
exports.rotateKeys = async (req, res) => {
  try {
    const { reason } = req.body;
    const org = await Organization.findById(req.user.orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // Archive current key to history
    org.pki.keyHistory.push({
      keyId: org.pki.keyId,
      publicKey: org.pki.publicKey,
      rotatedAt: new Date(),
      reason: reason || 'Scheduled key rotation',
    });

    // Generate fresh Ed25519 keypair
    const newKeyPair = generateOrgKeyPair();
    org.pki.publicKey = newKeyPair.publicKey;
    org.pki.privateKeyEncrypted = newKeyPair.privateKey;
    org.pki.keyId = newKeyPair.keyId;
    org.pki.createdAt = new Date();

    await org.save();

    await logSecurityEvent({
      action: 'KEY_ROTATED',
      orgId: org._id,
      userId: req.user._id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { newKeyId: newKeyPair.keyId, reason: reason || 'Key Rotation' },
    });

    const orgObj = org.toObject();
    delete orgObj.pki.privateKeyEncrypted;

    res.json({
      success: true,
      message: 'Cryptographic keypair rotated successfully. Previous public keys archived for historical verification.',
      organization: orgObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get organization statistics
 */
exports.getStats = async (req, res) => {
  try {
    const orgId = req.user.orgId;

    const totalIssued = await Certificate.countDocuments({ 'issuer.orgId': orgId });
    const totalRevoked = await Certificate.countDocuments({ 'issuer.orgId': orgId, status: 'revoked' });
    const totalValid = await Certificate.countDocuments({ 'issuer.orgId': orgId, status: 'valid' });
    const batchIssued = await Certificate.countDocuments({ 'issuer.orgId': orgId, 'crypto.merkle.isBatch': true });

    // Aggregate verifications
    const certs = await Certificate.find({ 'issuer.orgId': orgId }).select('verificationCount');
    const totalVerifications = certs.reduce((acc, c) => acc + (c.verificationCount || 0), 0);

    // Recent 5 issued
    const recentCertificates = await Certificate.find({ 'issuer.orgId': orgId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalIssued,
        totalValid,
        totalRevoked,
        batchIssued,
        totalVerifications,
      },
      recentCertificates,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public list of verified organizations & their public keys
 */
exports.getAllVerifiedOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find({ status: 'verified' })
      .select('name code email website logoUrl pki.publicKey pki.keyId stats createdAt');

    res.json({
      success: true,
      organizations: orgs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
