const AuditLog = require('../models/AuditLog');

/**
 * Logs an event into the immutable audit trail
 */
async function logSecurityEvent({
  action,
  certificateId = null,
  orgId = null,
  userId = null,
  ipAddress = '127.0.0.1',
  userAgent = 'VerifyX-Client',
  status = 'SUCCESS',
  details = {},
}) {
  try {
    const log = await AuditLog.create({
      action,
      certificateId,
      orgId,
      userId,
      ipAddress,
      userAgent,
      status,
      details,
    });
    return log;
  } catch (err) {
    console.error('[Audit Service] Failed to record audit log:', err.message);
  }
}

module.exports = {
  logSecurityEvent,
};
