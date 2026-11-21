const crypto = require('crypto');
const fs = require('fs');
const csv = require('csv-parser');
const Certificate = require('../models/Certificate');
const Organization = require('../models/Organization');
const Template = require('../models/Template');
const { signPayload, verifySignature } = require('../crypto/pkiEngine');
const { hashObject, hashBufferOrString } = require('../crypto/hasher');
const { buildMerkleTree, getMerkleProof } = require('../crypto/merkleEngine');
const { generateCertificatePdf } = require('../services/pdfService');
const { generateQRCodeDataUrl } = require('../services/qrService');
const { logSecurityEvent } = require('../services/auditService');

/**
 * Helper to generate unique Certificate ID
 */
function generateCertId(orgCode) {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VX-${orgCode.toUpperCase()}-${year}-${randomSuffix}`;
}

/**
 * Issue a single cryptographically signed certificate
 */
exports.issueSingleCertificate = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Issuing organization not found.' });
    }

    if (org.status !== 'verified') {
      return res.status(403).json({ success: false, message: 'Organization must be verified by admin before issuing certificates.' });
    }

    const {
      recipientName,
      recipientEmail,
      rollNumber,
      department,
      title,
      courseName,
      major,
      gradeOrScore,
      issueDate,
      expiryDate,
      description,
      customFields,
      templateId,
    } = req.body;

    if (!recipientName || !recipientEmail || !title) {
      return res.status(400).json({ success: false, message: 'Recipient name, email, and credential title are required.' });
    }

    const certificateId = generateCertId(org.code);
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientBaseUrl}/verify/${certificateId}`;

    // 1. Construct Canonical JSON Payload (RFC 8785)
    const canonicalPayload = {
      certificateId,
      recipient: {
        name: recipientName.trim(),
        email: recipientEmail.toLowerCase().trim(),
        rollNumber: rollNumber ? rollNumber.trim() : '',
        department: department ? department.trim() : '',
      },
      issuer: {
        orgId: org._id.toString(),
        orgName: org.name,
        orgCode: org.code,
        keyId: org.pki.keyId,
      },
      details: {
        title: title.trim(),
        courseName: courseName ? courseName.trim() : '',
        major: major ? major.trim() : '',
        gradeOrScore: gradeOrScore ? gradeOrScore.trim() : '',
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        expiryDate: expiryDate || null,
        description: description || '',
      },
    };

    // 2. Compute SHA-256 Data Fingerprint
    const dataHash = hashObject(canonicalPayload);

    // 3. Digitally Sign with Ed25519 Private Key
    const signature = signPayload(canonicalPayload, org.pki.privateKeyEncrypted);

    // 4. Generate High-Res Dynamic QR Code
    const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl);

    // 5. Fetch Template or Default
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
    }

    // 6. Generate Authentic PDF with embedded QR and metadata
    const certPreviewData = {
      certificateId,
      recipient: canonicalPayload.recipient,
      issuer: canonicalPayload.issuer,
      details: canonicalPayload.details,
      crypto: {
        canonicalPayload,
        dataHash,
        signature,
      },
      verificationUrl,
    };

    const pdfResult = await generateCertificatePdf(certPreviewData, template);

    // 7. Save Certificate to Database
    const certificate = await Certificate.create({
      certificateId,
      recipient: canonicalPayload.recipient,
      issuer: canonicalPayload.issuer,
      details: canonicalPayload.details,
      crypto: {
        canonicalPayload,
        dataHash,
        signature,
        publicKeyUsed: org.pki.publicKey,
        pdfHash: pdfResult.pdfHash,
        merkle: {
          isBatch: false,
        },
      },
      status: 'valid',
      templateId: template ? template._id : null,
      pdfUrl: pdfResult.relativeUrl,
      qrCodeDataUrl,
      verificationUrl,
    });

    // 8. Update Organization Stats
    org.stats.issuedCount += 1;
    await org.save();

    // 9. Record Immutable Audit Log
    await logSecurityEvent({
      action: 'CERTIFICATE_ISSUED',
      certificateId: certificate.certificateId,
      orgId: org._id,
      userId: req.user._id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: {
        recipient: certificate.recipient.name,
        title: certificate.details.title,
        dataHash,
        keyId: org.pki.keyId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Certificate successfully issued with Ed25519 cryptographic signature.',
      certificate,
    });
  } catch (err) {
    console.error('[Certificate Controller] Issue error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Issue Batch Certificates via CSV upload with Merkle Tree Anchor
 */
exports.issueBatchCertificates = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Issuing organization not found.' });
    }

    if (org.status !== 'verified') {
      return res.status(403).json({ success: false, message: 'Organization must be verified before batch issuance.' });
    }

    let records = [];

    // Check if CSV file was uploaded or JSON array sent
    if (req.file) {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
      records = results;
      // Remove temp file
      fs.unlinkSync(req.file.path);
    } else if (Array.isArray(req.body.records) && req.body.records.length > 0) {
      records = req.body.records;
    } else {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file or provide records array.' });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid records found in batch.' });
    }

    const batchId = `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Step 1: Pre-process each record, canonicalize and compute leaf hashes
    const certDrafts = [];
    const leafHashes = [];

    for (const row of records) {
      const recipientName = row.name || row.Name || row.recipientName || 'Student';
      const recipientEmail = row.email || row.Email || row.recipientEmail || `student_${Date.now()}@domain.com`;
      const rollNumber = row.rollNumber || row.RollNumber || row.roll_no || '';
      const department = row.department || row.Department || '';
      const title = row.title || row.Title || req.body.batchTitle || 'Certificate of Completion';
      const courseName = row.courseName || row.CourseName || row.course || '';
      const gradeOrScore = row.grade || row.Grade || row.gradeOrScore || '';

      const certificateId = generateCertId(org.code);
      const verificationUrl = `${clientBaseUrl}/verify/${certificateId}`;

      const canonicalPayload = {
        certificateId,
        recipient: {
          name: recipientName.trim(),
          email: recipientEmail.toLowerCase().trim(),
          rollNumber: rollNumber ? rollNumber.toString().trim() : '',
          department: department ? department.trim() : '',
        },
        issuer: {
          orgId: org._id.toString(),
          orgName: org.name,
          orgCode: org.code,
          keyId: org.pki.keyId,
        },
        details: {
          title: title.trim(),
          courseName: courseName ? courseName.trim() : '',
          major: department || '',
          gradeOrScore: gradeOrScore ? gradeOrScore.toString().trim() : '',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: null,
          description: `Batch Credential Issue - Batch Ref: ${batchId}`,
        },
      };

      const dataHash = hashObject(canonicalPayload);
      const signature = signPayload(canonicalPayload, org.pki.privateKeyEncrypted);

      leafHashes.push(dataHash);
      certDrafts.push({
        certificateId,
        canonicalPayload,
        dataHash,
        signature,
        verificationUrl,
      });
    }

    // Step 2: Build Merkle Tree from all leaf hashes
    const { tree, root } = buildMerkleTree(leafHashes);

    // Step 3: Generate PDFs, QR codes, Merkle proofs and save to DB
    const savedCertificates = [];

    for (const draft of certDrafts) {
      const merkleProof = getMerkleProof(tree, draft.dataHash);
      const qrCodeDataUrl = await generateQRCodeDataUrl(draft.verificationUrl);

      const certPreviewData = {
        certificateId: draft.certificateId,
        recipient: draft.canonicalPayload.recipient,
        issuer: draft.canonicalPayload.issuer,
        details: draft.canonicalPayload.details,
        crypto: {
          canonicalPayload: draft.canonicalPayload,
          dataHash: draft.dataHash,
          signature: draft.signature,
        },
        verificationUrl: draft.verificationUrl,
      };

      const pdfResult = await generateCertificatePdf(certPreviewData);

      const certDoc = await Certificate.create({
        certificateId: draft.certificateId,
        recipient: draft.canonicalPayload.recipient,
        issuer: draft.canonicalPayload.issuer,
        details: draft.canonicalPayload.details,
        crypto: {
          canonicalPayload: draft.canonicalPayload,
          dataHash: draft.dataHash,
          signature: draft.signature,
          publicKeyUsed: org.pki.publicKey,
          pdfHash: pdfResult.pdfHash,
          merkle: {
            isBatch: true,
            batchId,
            root,
            leafHash: draft.dataHash,
            proof: merkleProof,
          },
        },
        status: 'valid',
        pdfUrl: pdfResult.relativeUrl,
        qrCodeDataUrl,
        verificationUrl: draft.verificationUrl,
      });

      savedCertificates.push(certDoc);
    }

    // Update organization stats
    org.stats.issuedCount += savedCertificates.length;
    await org.save();

    // Record Batch Audit Event
    await logSecurityEvent({
      action: 'BATCH_CERTIFICATES_ISSUED',
      orgId: org._id,
      userId: req.user._id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: {
        batchId,
        count: savedCertificates.length,
        merkleRoot: root,
      },
    });

    res.status(201).json({
      success: true,
      message: `Successfully issued ${savedCertificates.length} certificates anchored by Merkle Root.`,
      batch: {
        batchId,
        count: savedCertificates.length,
        merkleRoot: root,
        certificates: savedCertificates,
      },
    });
  } catch (err) {
    console.error('[Certificate Controller] Batch issue error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Revoke an issued certificate
 */
exports.revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cert = await Certificate.findOne({ certificateId: id.toUpperCase() });
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    // Check if requester owns the issuing org or is admin
    if (req.user.role !== 'admin' && cert.issuer.orgId.toString() !== req.user.orgId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to revoke certificates for this organization.' });
    }

    if (cert.status === 'revoked') {
      return res.status(400).json({ success: false, message: 'Certificate is already revoked.' });
    }

    // Compute cryptographic revocation hash
    const revocationFingerprint = hashBufferOrString(`${cert.certificateId}:${Date.now()}:${reason || 'Revoked by authority'}`);

    cert.status = 'revoked';
    cert.revocationDetails = {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy: req.user._id,
      reason: reason || 'Revoked by issuing authority',
      revocationHash: revocationFingerprint,
    };

    await cert.save();

    // Increment Org revoked count
    await Organization.findByIdAndUpdate(cert.issuer.orgId, {
      $inc: { 'stats.revokedCount': 1 },
    });

    // Record Audit Log
    await logSecurityEvent({
      action: 'CERTIFICATE_REVOKED',
      certificateId: cert.certificateId,
      orgId: cert.issuer.orgId,
      userId: req.user._id,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      status: 'WARNING',
      details: {
        reason: reason || 'Revoked by issuing authority',
        revocationHash: revocationFingerprint,
      },
    });

    res.json({
      success: true,
      message: 'Certificate successfully revoked. Public status updated to REVOKED.',
      certificate: cert,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get certificates for organization with filters & search
 */
exports.getOrgCertificates = async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = { 'issuer.orgId': orgId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { certificateId: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
        { 'recipient.email': { $regex: search, $options: 'i' } },
        { 'recipient.rollNumber': { $regex: search, $options: 'i' } },
        { 'details.title': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      certificates,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Certificate by ID
 */
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findOne({ certificateId: id.toUpperCase() });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    res.json({
      success: true,
      certificate: cert,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
