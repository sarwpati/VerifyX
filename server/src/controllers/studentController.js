const Certificate = require('../models/Certificate');
const User = require('../models/User');

/**
 * Get certificates for current logged-in student
 */
exports.getMyCertificates = async (req, res) => {
  try {
    const student = req.user;
    const query = {
      $or: [
        { 'recipient.email': student.email.toLowerCase() },
      ],
    };

    if (student.studentProfile && student.studentProfile.rollNumber) {
      query.$or.push({ 'recipient.rollNumber': student.studentProfile.rollNumber });
    }

    const certificates = await Certificate.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      studentProfile: student.studentProfile,
      certificates,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public Shareable Student Credential Locker / Wallet
 */
exports.getPublicWallet = async (req, res) => {
  try {
    const { identifier } = req.params; // email or roll number or studentId
    const cleanId = identifier.trim();

    const certificates = await Certificate.find({
      $or: [
        { 'recipient.email': cleanId.toLowerCase() },
        { 'recipient.rollNumber': cleanId },
      ],
      status: 'valid', // only show active valid certs publicly
    }).sort({ createdAt: -1 });

    const studentUser = await User.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        { 'studentProfile.rollNumber': cleanId },
      ],
    }).select('name email studentProfile');

    res.json({
      success: true,
      student: studentUser || {
        name: certificates[0]?.recipient.name || 'Verified Scholar',
        email: cleanId,
      },
      credentialsCount: certificates.length,
      certificates,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
