const Certificate = require('../models/Certificate');
const Organization = require('../models/Organization');
const { verifySignature } = require('../crypto/pkiEngine');
const { hashObject, hashBufferOrString } = require('../crypto/hasher');
const { verifyMerkleProof } = require('../crypto/merkleEngine');
const { logSecurityEvent } = require('../services/auditService');

/**
 * Public Online Verification by Certificate ID
 */
exports.verifyOnline = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = (id || '').trim().toUpperCase();

    if (!cleanId) {
      return res.status(400).json({ success: false, message: 'Certificate ID is required.' });
    }

    const cert = await Certificate.findOne({ certificateId: cleanId });

    if (!cert) {
      await logSecurityEvent({
        action: 'CERTIFICATE_VERIFIED_ONLINE',
        certificateId: cleanId,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser',
        status: 'FAILURE',
        details: { result: 'NOT_FOUND', query: cleanId },
      });

      return res.status(404).json({
        success: false,
        verificationStatus: 'NOT_FOUND',
        message: 'No certificate found with this ID. The credential may be counterfeit or unregistered.',
      });
    }

    // Step 1: Recompute SHA-256 dataHash from canonical payload
    const computedDataHash = hashObject(cert.crypto.canonicalPayload);
    const isDataHashValid = computedDataHash === cert.crypto.dataHash;

    // Step 2: Retrieve Public Key (from Org or historical snapshot)
    const org = await Organization.findById(cert.issuer.orgId);
    let publicKey = cert.crypto.publicKeyUsed;
    if (org && org.pki && org.pki.publicKey) {
      publicKey = org.pki.publicKey;
      // If rotated, check history
      if (org.pki.keyId !== cert.issuer.keyId && org.pki.keyHistory) {
        const historical = org.pki.keyHistory.find((k) => k.keyId === cert.issuer.keyId);
        if (historical) publicKey = historical.publicKey;
      }
    }

    // Step 3: Verify Asymmetric Ed25519 Digital Signature
    const isSignatureValid = verifySignature(cert.crypto.canonicalPayload, cert.crypto.signature, publicKey);

    // Step 4: Verify Merkle Proof (if batch issued)
    let isMerkleValid = true;
    if (cert.crypto.merkle && cert.crypto.merkle.isBatch && cert.crypto.merkle.proof) {
      isMerkleValid = verifyMerkleProof(
        cert.crypto.merkle.proof,
        cert.crypto.dataHash,
        cert.crypto.merkle.root
      );
    }

    // Step 5: Determine Final Status
    let overallStatus = cert.status.toUpperCase(); // 'VALID', 'REVOKED', 'EXPIRED'
    let isTampered = false;
    let tamperDetails = [];

    if (!isDataHashValid) {
      isTampered = true;
      tamperDetails.push('Canonical payload SHA-256 hash mismatch.');
    }
    if (!isSignatureValid) {
      isTampered = true;
      tamperDetails.push('Ed25519 digital signature mathematical verification failed.');
    }
    if (!isMerkleValid) {
      isTampered = true;
      tamperDetails.push('Merkle inclusion proof verification failed.');
    }

    if (isTampered) {
      overallStatus = 'TAMPERED';
    } else if (cert.status === 'revoked') {
      overallStatus = 'REVOKED';
    } else if (cert.details.expiryDate && new Date(cert.details.expiryDate) < new Date()) {
      overallStatus = 'EXPIRED';
    } else {
      overallStatus = 'VALID';
    }

    // Update stats
    cert.verificationCount += 1;
    cert.lastVerifiedAt = new Date();
    await cert.save();

    if (org) {
      org.stats.verifiedCount += 1;
      await org.save();
    }

    // Record Audit Log
    await logSecurityEvent({
      action: isTampered ? 'TAMPER_ATTEMPT_DETECTED' : 'CERTIFICATE_VERIFIED_ONLINE',
      certificateId: cert.certificateId,
      orgId: cert.issuer.orgId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      status: isTampered ? 'SECURITY_ALERT' : (overallStatus === 'VALID' ? 'SUCCESS' : 'WARNING'),
      details: {
        verificationStatus: overallStatus,
        isSignatureValid,
        isDataHashValid,
        isMerkleValid,
        tamperDetails,
      },
    });

    res.json({
      success: true,
      verificationStatus: overallStatus,
      isAuthentic: overallStatus === 'VALID',
      certificate: cert,
      cryptographicProof: {
        algorithm: 'Ed25519 (Edwards-curve Digital Signature)',
        hashAlgorithm: 'SHA-256 (FIPS 180-4)',
        canonicalizationStandard: 'RFC 8785 (JSON Canonicalization Scheme)',
        isSignatureValid,
        isDataHashValid,
        isMerkleValid,
        keyId: cert.issuer.keyId,
        computedDataHash,
        storedDataHash: cert.crypto.dataHash,
        signatureSample: cert.crypto.signature.substring(0, 32) + '...',
        merkleRoot: cert.crypto.merkle?.root || null,
        isBatchIssued: !!cert.crypto.merkle?.isBatch,
      },
      issuerOrganization: org ? {
        name: org.name,
        code: org.code,
        status: org.status,
        website: org.website,
        logoUrl: org.logoUrl,
      } : null,
      revocationDetails: cert.revocationDetails,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Verify Controller] Verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public PDF Drag-and-Drop Tamper Inspector
 */
exports.verifyPdfFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF certificate file to inspect.' });
    }

    const fileBuffer = req.file.buffer;
    const uploadedPdfHash = hashBufferOrString(fileBuffer);

    // 1. Direct match: Exact PDF hash match
    const exactMatchCert = await Certificate.findOne({ 'crypto.pdfHash': uploadedPdfHash });

    if (exactMatchCert) {
      // PDF is 100% authentic byte-for-byte
      exactMatchCert.verificationCount += 1;
      exactMatchCert.lastVerifiedAt = new Date();
      await exactMatchCert.save();

      await logSecurityEvent({
        action: 'CERTIFICATE_VERIFIED_PDF_TAMPER_CHECK',
        certificateId: exactMatchCert.certificateId,
        orgId: exactMatchCert.issuer.orgId,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser',
        status: exactMatchCert.status === 'valid' ? 'SUCCESS' : 'WARNING',
        details: { result: 'UNTOUCHED_ORIGINAL', pdfHash: uploadedPdfHash },
      });

      return res.json({
        success: true,
        verificationStatus: exactMatchCert.status === 'valid' ? 'VALID' : exactMatchCert.status.toUpperCase(),
        tamperVerdict: 'AUTHENTIC_ORIGINAL_DOCUMENT',
        message: 'The uploaded PDF matches the official issuer cryptographic hash byte-for-byte. No alterations detected.',
        uploadedPdfHash,
        certificate: exactMatchCert,
        isTampered: false,
      });
    }

    // 2. Search if certificate ID exists in filename or embedded metadata
    let possibleCertId = null;
    const filenameMatch = req.file.originalname.match(/VX-[A-Z0-9]+-\d{4}-\d+/i);
    if (filenameMatch) {
      possibleCertId = filenameMatch[0].toUpperCase();
    }

    if (possibleCertId) {
      const dbCert = await Certificate.findOne({ certificateId: possibleCertId });
      if (dbCert) {
        // Tamper Detected! The certificate ID belongs to a real credential, but the PDF content hash does NOT match the generated original!
        await logSecurityEvent({
          action: 'TAMPER_ATTEMPT_DETECTED',
          certificateId: dbCert.certificateId,
          orgId: dbCert.issuer.orgId,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          status: 'SECURITY_ALERT',
          details: {
            result: 'TAMPERED_PDF_FILE',
            expectedHash: dbCert.crypto.pdfHash,
            actualHash: uploadedPdfHash,
            filename: req.file.originalname,
          },
        });

        return res.json({
          success: false,
          verificationStatus: 'TAMPERED',
          tamperVerdict: 'TAMPER_DETECTED',
          message: 'SECURITY ALERT: The uploaded document has been modified after issuance. The cryptographic SHA-256 byte-hash does not match the official record.',
          certificate: dbCert,
          isTampered: true,
          tamperDetails: {
            expectedPdfHash: dbCert.crypto.pdfHash,
            uploadedPdfHash: uploadedPdfHash,
            identifiedCertificateId: dbCert.certificateId,
            recipientName: dbCert.recipient.name,
            reason: 'Binary stream or visual contents of the PDF were altered post-signing.',
          },
        });
      }
    }

    // 3. Document is unrecognized / not generated on VerifyX
    return res.status(404).json({
      success: false,
      verificationStatus: 'UNRECOGNIZED',
      tamperVerdict: 'UNREGISTERED_OR_COUNTERFEIT',
      message: 'This document could not be matched with any registered cryptographic record on the VerifyX network.',
      uploadedPdfHash,
    });
  } catch (err) {
    console.error('[Verify Controller] PDF verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
