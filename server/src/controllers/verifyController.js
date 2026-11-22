const Certificate = require('../models/Certificate');
const Organization = require('../models/Organization');
const { verifySignature } = require('../crypto/pkiEngine');
const { hashObject, hashBufferOrString } = require('../crypto/hasher');
const { verifyMerkleProof } = require('../crypto/merkleEngine');
const { logSecurityEvent } = require('../services/auditService');
const { PDFDocument } = require('pdf-lib');
const { PDFParse } = require('pdf-parse');

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
        tamperVerdict: 'ORG_NOT_LISTED',
        reasonCode: 'ORGANIZATION_NOT_LISTED',
        message: 'Your certificate organization is not listed on VerifyX. We need some time to contact your organization and let you know if your certificate is valid or not.',
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

    await logSecurityEvent({
      action: 'CERTIFICATE_VERIFIED_ONLINE',
      certificateId: cert.certificateId,
      orgId: cert.issuer.orgId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      status: overallStatus === 'VALID' ? 'SUCCESS' : 'WARNING',
      details: {
        verificationStatus: overallStatus,
        isDataHashValid,
        isSignatureValid,
        isMerkleValid,
      },
    });

    return res.json({
      success: true,
      verificationStatus: overallStatus,
      isAuthentic: overallStatus === 'VALID',
      certificate: {
        certificateId: cert.certificateId,
        recipient: cert.recipient,
        issuer: cert.issuer,
        details: cert.details,
        crypto: {
          algorithm: cert.crypto.algorithm,
          keyId: cert.crypto.keyId,
          dataHash: cert.crypto.dataHash,
          signature: cert.crypto.signature,
          pdfHash: cert.crypto.pdfHash,
          merkle: cert.crypto.merkle,
        },
        pdfUrl: cert.pdfUrl,
        qrCodeDataUrl: cert.qrCodeDataUrl,
        verificationUrl: cert.verificationUrl,
        status: cert.status,
        revocationDetails: cert.revocationDetails,
        verificationCount: cert.verificationCount,
        lastVerifiedAt: cert.lastVerifiedAt,
      },
      cryptographicProof: {
        algorithm: 'Ed25519',
        canonicalizer: 'RFC 8785 (JCS)',
        hashFunction: 'SHA-256',
        isDataHashValid,
        isSignatureValid,
        isMerkleValid,
        computedDataHash,
        publicKeyUsed: publicKey,
        keyId: cert.issuer.keyId,
      },
      issuerOrganization: org
        ? {
            id: org._id,
            name: org.name,
            code: org.code,
            domain: org.domain,
            verified: org.verificationStatus === 'verified',
            publicKey: org.pki?.publicKey,
            keyId: org.pki?.keyId,
          }
        : null,
      tamperVerdict: isTampered ? 'TAMPER_DETECTED' : 'UNALTERED_ORIGINAL',
      tamperDetails,
      revocationDetails: cert.status === 'revoked' ? cert.revocationDetails : null,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Verify Controller] Verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public PDF Upload & Tamper / Scanner Inspector
 */
exports.verifyPdfFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF certificate file to inspect.' });
    }

    const fileBuffer = req.file.buffer;
    const uploadedPdfHash = hashBufferOrString(fileBuffer);

    // 1. Direct match: Exact PDF hash match in DB
    const exactMatchCert = await Certificate.findOne({ 'crypto.pdfHash': uploadedPdfHash });

    if (exactMatchCert) {
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
        hasScanner: true,
        isTampered: false,
      });
    }

    // 2. Parse PDF metadata and visual/text contents
    let extractedText = '';
    let pdfMetadata = {};
    let extractedCertId = null;
    let extractedOrgName = null;

    try {
      const uint8 = new Uint8Array(fileBuffer);
      const parser = new PDFParse(uint8);
      const parsedData = await parser.getText();
      extractedText = parsedData?.text || '';
    } catch (parseErr) {
      console.warn('[Verify Controller] PDF text parsing warning:', parseErr.message);
    }

    try {
      const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
      pdfMetadata = {
        title: pdfDoc.getTitle(),
        author: pdfDoc.getAuthor(),
        subject: pdfDoc.getSubject(),
        keywords: pdfDoc.getKeywords(),
        producer: pdfDoc.getProducer(),
      };
      if (pdfMetadata.author) {
        extractedOrgName = pdfMetadata.author;
      }
    } catch (metaErr) {
      console.warn('[Verify Controller] PDF metadata read warning:', metaErr.message);
    }

    // Try finding Certificate ID (VX-ORG-YYYY-XXXX pattern or similar)
    const combinedSearchStr = `${req.file.originalname} ${extractedText} ${pdfMetadata.title || ''} ${pdfMetadata.keywords || ''}`;
    const idPattern = /VX-[A-Z0-9]+-\d{4}-\d+/i;
    const match = combinedSearchStr.match(idPattern);
    if (match) {
      extractedCertId = match[0].toUpperCase();
    }

    // 3. Scanner / QR Check:
    // Does the PDF mention scan/scanner, or contain a verification URL / QR scanner marker?
    const hasScannerWords = /(scan|scanner|qr\s*code|scan\s*to\s*verify|verifyx|\/verify\/)/i.test(extractedText);
    const hasScannerMeta = pdfMetadata.keywords && /Tamper-Evident|VerifyX/i.test(pdfMetadata.keywords);
    const hasScanner = hasScannerWords || !!hasScannerMeta;

    // If PDF definitely lacks any scanner / QR code marker:
    if (!hasScanner && !extractedCertId) {
      return res.status(422).json({
        success: false,
        verificationStatus: 'NO_SCANNER',
        tamperVerdict: 'MISSING_SCANNER',
        reasonCode: 'SCANNER_NOT_FOUND',
        hasScanner: false,
        message: 'Certificate does not contain a scanner/QR code to verify. Please upload a scanner-consistent certificate.',
        uploadedPdfHash,
      });
    }

    // 4. If Certificate ID is identified, check database for tamper or validity
    if (extractedCertId) {
      const dbCert = await Certificate.findOne({ certificateId: extractedCertId });
      if (dbCert) {
        // Real Certificate ID, but PDF byte hash didn't match -> Tamper Alert!
        await logSecurityEvent({
          action: 'TAMPER_ATTEMPT_DETECTED',
          certificateId: dbCert.certificateId,
          orgId: dbCert.issuer.orgId,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          status: 'SECURITY_ALERT',
          details: {
            result: 'TAMPERED_PDF_FILE',
            expectedHash: dbCert.crypto?.pdfHash,
            actualHash: uploadedPdfHash,
            filename: req.file.originalname,
          },
        });

        return res.json({
          success: false,
          verificationStatus: 'TAMPERED',
          tamperVerdict: 'TAMPER_DETECTED',
          reasonCode: 'HASH_MISMATCH',
          hasScanner: true,
          message: 'SECURITY ALERT: The uploaded document has been modified after issuance. The cryptographic SHA-256 byte-hash does not match the official record.',
          certificate: dbCert,
          isTampered: true,
          tamperDetails: {
            expectedPdfHash: dbCert.crypto?.pdfHash,
            uploadedPdfHash,
            identifiedCertificateId: dbCert.certificateId,
            recipientName: dbCert.recipient?.name,
            reason: 'Binary stream or visual contents of the PDF were altered post-signing.',
          },
        });
      }
    }

    // 5. If we could not verify whether it is valid or not:
    // Determine relevant reasons (e.g. Organization not listed, unindexed certificate)
    let orgNameDetected = extractedOrgName;
    if (!orgNameDetected) {
      const orgLines = extractedText.split('\n').map((l) => l.trim()).filter(Boolean);
      if (orgLines.length > 0) {
        orgNameDetected = orgLines[0].substring(0, 50);
      }
    }

    // Check if the organization name matches any registered organization in VerifyX
    let isOrgListed = false;
    if (orgNameDetected) {
      const matchedOrg = await Organization.findOne({
        $or: [
          { name: new RegExp(orgNameDetected, 'i') },
          { code: new RegExp(orgNameDetected, 'i') }
        ]
      });
      if (matchedOrg) isOrgListed = true;
    }

    return res.status(404).json({
      success: false,
      verificationStatus: 'UNABLE_TO_VERIFY',
      tamperVerdict: 'ORGANIZATION_NOT_LISTED',
      reasonCode: 'ORG_NOT_REGISTERED',
      hasScanner: hasScanner,
      detectedOrg: orgNameDetected || 'Unknown Organization',
      detectedCertId: extractedCertId || null,
      message: 'Your certificate organization is not listed on VerifyX. We need some time to contact your organization and let you know if your certificate is valid or not.',
      uploadedPdfHash,
    });

  } catch (err) {
    console.error('[Verify Controller] PDF verify error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
