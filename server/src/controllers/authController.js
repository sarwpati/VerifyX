const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../middleware/auth');
const { generateOrgKeyPair } = require('../crypto/pkiEngine');
const { logSecurityEvent } = require('../services/auditService');

/**
 * Register a new user
 * Roles: 'student', 'org', 'admin'
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, orgData, studentProfile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    let createdOrg = null;

    // If registering as an organization, create the Organization and PKI keypair
    if (role === 'org') {
      if (!orgData || !orgData.name || !orgData.code) {
        return res.status(400).json({ success: false, message: 'Organization name and code are required.' });
      }

      const existingOrg = await Organization.findOne({ code: orgData.code.toUpperCase() });
      if (existingOrg) {
        return res.status(400).json({ success: false, message: 'An organization with this code already exists.' });
      }

      // Generate Ed25519 PKI Keypair
      const keyPair = generateOrgKeyPair();

      createdOrg = await Organization.create({
        name: orgData.name,
        code: orgData.code.toUpperCase(),
        email: email.toLowerCase(),
        website: orgData.website || '',
        description: orgData.description || '',
        logoUrl: orgData.logoUrl || '',
        status: 'verified', // Auto-verify for easy evaluation
        pki: {
          publicKey: keyPair.publicKey,
          privateKeyEncrypted: keyPair.privateKey,
          keyId: keyPair.keyId,
          algorithm: keyPair.algorithm,
        },
        signerInfo: {
          signatoryName: orgData.signatoryName || name,
          signatoryTitle: orgData.signatoryTitle || 'Registrar / Dean',
        },
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      orgId: createdOrg ? createdOrg._id : null,
      studentProfile: role === 'student' ? (studentProfile || {}) : undefined,
    });

    const token = generateToken(user._id);

    await logSecurityEvent({
      action: 'USER_LOGIN',
      userId: user._id,
      orgId: user.orgId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { role: user.role, event: 'REGISTER_AND_LOGIN' },
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        studentProfile: user.studentProfile,
      },
      organization: createdOrg,
    });
  } catch (err) {
    console.error('[Auth Controller] Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Login existing user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    let organization = null;
    if (user.orgId) {
      organization = await Organization.findById(user.orgId);
    }

    const token = generateToken(user._id);

    await logSecurityEvent({
      action: 'USER_LOGIN',
      userId: user._id,
      orgId: user.orgId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: { role: user.role, event: 'LOGIN_SUCCESS' },
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        studentProfile: user.studentProfile,
      },
      organization,
    });
  } catch (err) {
    console.error('[Auth Controller] Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get current logged in user & organization
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let organization = null;
    if (user.orgId) {
      organization = await Organization.findById(user.orgId);
    }

    res.json({
      success: true,
      user,
      organization,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Quick demo accounts for examiner / viva presentations
 */
exports.getDemoAccounts = (req, res) => {
  res.json({
    success: true,
    accounts: [
      {
        role: 'admin',
        title: 'Platform Administrator',
        email: 'admin@verifyx.io',
        password: 'Password123!',
        description: 'Manage all verified institutions, monitor global audit logs & anti-fraud analytics.',
      },
      {
        role: 'org',
        title: 'IIIT Bhagalpur (Issuing Institution)',
        email: 'registrar@iiitbh.ac.in',
        password: 'Password123!',
        description: 'Issue single & batch certificates with Ed25519 PKI signatures, Merkle trees, and templates.',
      },
      {
        role: 'org',
        title: 'Google Cloud Academy',
        email: 'credentials@googlecloud.academy',
        password: 'Password123!',
        description: 'Enterprise credential issuer with custom cryptographic keypair and templates.',
      },
      {
        role: 'org',
        title: 'ServiceNow, Inc. (Workflow Authority)',
        email: 'certifications@servicenow.com',
        password: 'Password123!',
        description: 'Enterprise ServiceNow CSA & CAD cloud credential issuing authority.',
      },
      {
        role: 'student',
        title: 'Sarwpati Kumar (ServiceNow CSA Certified)',
        email: 'sarwpati.kumar@iiitbh.ac.in',
        password: 'Password123!',
        description: 'View ServiceNow Certified System Administrator (CSA) credential & verified digital wallet.',
      },
      {
        role: 'student',
        title: 'Aarav Sharma (Student / Credential Holder)',
        email: 'aarav.sharma@iiitbh.ac.in',
        password: 'Password123!',
        description: 'View digital wallet, share on LinkedIn, download verified tamper-evident PDFs.',
      },
    ],
  });
};
