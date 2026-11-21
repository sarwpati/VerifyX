const Organization = require('../models/Organization');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { logSecurityEvent } = require('../services/auditService');

/**
 * Get global admin dashboard metrics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrgs = await Organization.countDocuments();
    const verifiedOrgs = await Organization.countDocuments({ status: 'verified' });
    const pendingOrgs = await Organization.countDocuments({ status: 'pending' });

    const totalCertificates = await Certificate.countDocuments();
    const validCertificates = await Certificate.countDocuments({ status: 'valid' });
    const revokedCertificates = await Certificate.countDocuments({ status: 'revoked' });
    const batchIssuedCertificates = await Certificate.countDocuments({ 'crypto.merkle.isBatch': true });

    const certs = await Certificate.find().select('verificationCount');
    const totalVerifications = certs.reduce((acc, c) => acc + (c.verificationCount || 0), 0);

    const totalTamperAttempts = await AuditLog.countDocuments({ action: 'TAMPER_ATTEMPT_DETECTED' });
    const totalSecurityAlerts = await AuditLog.countDocuments({ status: 'SECURITY_ALERT' });

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      metrics: {
        totalOrgs,
        verifiedOrgs,
        pendingOrgs,
        totalCertificates,
        validCertificates,
        revokedCertificates,
        batchIssuedCertificates,
        totalVerifications,
        totalTamperAttempts,
        totalSecurityAlerts,
        totalUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all organizations for admin management
 */
exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    res.json({ success: true, organizations: orgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update organization verification status (Approve / Suspend)
 */
exports.updateOrgStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'verified', 'suspended', 'pending'

    if (!['verified', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const org = await Organization.findByIdAndUpdate(
      id,
      {
        status,
        verifiedAt: status === 'verified' ? new Date() : undefined,
        verifiedBy: req.user._id,
      },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    await logSecurityEvent({
      action: status === 'verified' ? 'ORGANIZATION_VERIFIED' : 'ORGANIZATION_SUSPENDED',
      orgId: org._id,
      userId: req.user._id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      status: status === 'verified' ? 'SUCCESS' : 'WARNING',
      details: { newStatus: status, orgName: org.name, orgCode: org.code },
    });

    res.json({
      success: true,
      message: `Organization status updated to '${status}'.`,
      organization: org,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get filterable global audit logs
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, status, search, page = 1, limit = 25 } = req.query;

    const query = {};
    if (action && action !== 'all') query.action = action;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('orgId', 'name code')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Security Analytics Chart Data
 */
exports.getSecurityAnalytics = async (req, res) => {
  try {
    // Generate analytics breakdown for charts
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);

    const actionCounts = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
    ]);

    const statusCounts = await AuditLog.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      actionCounts,
      statusCounts,
      recentActivity: recentLogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
