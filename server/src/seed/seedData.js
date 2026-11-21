const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Template = require('../models/Template');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { generateOrgKeyPair, signPayload } = require('../crypto/pkiEngine');
const { hashObject, hashBufferOrString } = require('../crypto/hasher');
const { buildMerkleTree, getMerkleProof } = require('../crypto/merkleEngine');
const { generateCertificatePdf } = require('../services/pdfService');
const { generateQRCodeDataUrl } = require('../services/qrService');

async function seedDatabase() {
  console.log('[Seed] Seeding VerifyX Database with demo institutions, keys, and credentials...');

  // Clean old collections
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Template.deleteMany({}),
    Certificate.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Create Organizations & PKI Keypairs
  const iiitbhKeys = generateOrgKeyPair();
  const gcaKeys = generateOrgKeyPair();
  const snowKeys = generateOrgKeyPair();

  const iiitbhOrg = await Organization.create({
    name: 'Indian Institute of Information Technology Bhagalpur',
    code: 'IIITBH',
    email: 'registrar@iiitbh.ac.in',
    website: 'https://www.iiitbh.ac.in',
    description: 'Institute of National Importance under Ministry of Education, Government of India.',
    status: 'verified',
    pki: {
      publicKey: iiitbhKeys.publicKey,
      privateKeyEncrypted: iiitbhKeys.privateKey,
      keyId: iiitbhKeys.keyId,
      algorithm: 'Ed25519',
    },
    signerInfo: {
      signatoryName: 'Prof. D. K. Singh',
      signatoryTitle: 'Dean of Academic Affairs & Registrar',
    },
    stats: { issuedCount: 5, verifiedCount: 14, revokedCount: 1 },
  });

  const gcaOrg = await Organization.create({
    name: 'Google Cloud Academy',
    code: 'GCA',
    email: 'credentials@googlecloud.academy',
    website: 'https://cloud.google.com/certification',
    description: 'Official enterprise cloud certification authority and credential provider.',
    status: 'verified',
    pki: {
      publicKey: gcaKeys.publicKey,
      privateKeyEncrypted: gcaKeys.privateKey,
      keyId: gcaKeys.keyId,
      algorithm: 'Ed25519',
    },
    signerInfo: {
      signatoryName: 'Sarah Jenkins',
      signatoryTitle: 'Global Certification Director',
    },
    stats: { issuedCount: 2, verifiedCount: 8, revokedCount: 0 },
  });

  const snowOrg = await Organization.create({
    name: 'ServiceNow, Inc.',
    code: 'SNOW',
    email: 'certifications@servicenow.com',
    website: 'https://nowlearning.servicenow.com',
    description: 'Global cloud platform leader delivering digital workflow certifications.',
    status: 'verified',
    pki: {
      publicKey: snowKeys.publicKey,
      privateKeyEncrypted: snowKeys.privateKey,
      keyId: snowKeys.keyId,
      algorithm: 'Ed25519',
    },
    signerInfo: {
      signatoryName: 'Jayney Howson',
      signatoryTitle: 'Senior Vice President, Global Learning and Development ServiceNow',
    },
    stats: { issuedCount: 1, verifiedCount: 5, revokedCount: 0 },
  });

  // 2. Create Users
  const adminUser = await User.create({
    name: 'VerifyX Security Administrator',
    email: 'admin@verifyx.io',
    password: 'Password123!',
    role: 'admin',
  });

  const orgUser1 = await User.create({
    name: 'IIITBH Examination Cell',
    email: 'registrar@iiitbh.ac.in',
    password: 'Password123!',
    role: 'org',
    orgId: iiitbhOrg._id,
  });

  const orgUser2 = await User.create({
    name: 'Google Cloud Certifications',
    email: 'credentials@googlecloud.academy',
    password: 'Password123!',
    role: 'org',
    orgId: gcaOrg._id,
  });

  const orgUser3 = await User.create({
    name: 'ServiceNow Credential Authority',
    email: 'certifications@servicenow.com',
    password: 'Password123!',
    role: 'org',
    orgId: snowOrg._id,
  });

  const studentSarwpati = await User.create({
    name: 'Sarwpati Kumar',
    email: 'sarwpati.kumar@iiitbh.ac.in',
    password: 'Password123!',
    role: 'student',
    studentProfile: {
      rollNumber: '220101099',
      institution: 'Indian Institute of Information Technology Bhagalpur',
      degree: 'B.Tech Computer Science & Engineering',
    },
  });

  const student1 = await User.create({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@iiitbh.ac.in',
    password: 'Password123!',
    role: 'student',
    studentProfile: {
      rollNumber: '220101001',
      institution: 'Indian Institute of Information Technology Bhagalpur',
      degree: 'B.Tech Computer Science & Engineering',
    },
  });

  const student2 = await User.create({
    name: 'Priya Singh',
    email: 'priya.singh@iiitbh.ac.in',
    password: 'Password123!',
    role: 'student',
    studentProfile: {
      rollNumber: '220101045',
      institution: 'Indian Institute of Information Technology Bhagalpur',
      degree: 'B.Tech Data Science & AI',
    },
  });

  // 3. Create Templates
  const defaultTemplate = await Template.create({
    name: 'IIITBH Official Degree Gold & Emerald',
    orgId: iiitbhOrg._id,
    isDefault: true,
    layout: {
      theme: 'modern-emerald',
      primaryColor: '#047857',
      accentColor: '#d97706',
      borderStyle: 'ornate-guilloche',
      watermarkText: 'IIIT BHAGALPUR VERIFIED',
    },
    signatories: [
      { name: 'Prof. D. K. Singh', title: 'Dean of Academic Affairs' },
      { name: 'Dr. P. K. Ray', title: 'Director' },
    ],
  });

  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // Helper to issue demo cert
  async function createDemoCert({
    certId,
    recipient,
    org,
    title,
    courseName,
    grade,
    issueDate,
    expiryDate,
    status = 'valid',
    revocation = null,
  }) {
    const verificationUrl = `${clientBaseUrl}/verify/${certId}`;

    const canonicalPayload = {
      certificateId: certId,
      recipient: {
        name: recipient.name,
        email: recipient.email,
        rollNumber: recipient.rollNumber || '',
        department: recipient.department || '',
      },
      issuer: {
        orgId: org._id.toString(),
        orgName: org.name,
        orgCode: org.code,
        keyId: org.pki.keyId,
      },
      details: {
        title,
        courseName: courseName || '',
        major: recipient.department || '',
        gradeOrScore: grade || '',
        issueDate: issueDate || '2026-06-15',
        expiryDate: expiryDate || null,
        description: 'Official academic award granted with full honors.',
      },
    };

    const dataHash = hashObject(canonicalPayload);
    const signature = signPayload(canonicalPayload, org.pki.privateKeyEncrypted);
    const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl);

    const pdfResult = await generateCertificatePdf({
      certificateId: certId,
      recipient: canonicalPayload.recipient,
      issuer: canonicalPayload.issuer,
      details: canonicalPayload.details,
      crypto: { canonicalPayload, dataHash, signature },
      verificationUrl,
    });

    const cert = await Certificate.create({
      certificateId: certId,
      recipient: canonicalPayload.recipient,
      issuer: canonicalPayload.issuer,
      details: canonicalPayload.details,
      crypto: {
        canonicalPayload,
        dataHash,
        signature,
        publicKeyUsed: org.pki.publicKey,
        pdfHash: pdfResult.pdfHash,
        merkle: { isBatch: false },
      },
      status,
      revocationDetails: revocation ? {
        isRevoked: true,
        revokedAt: new Date(revocation.date || Date.now()),
        revokedBy: orgUser1._id,
        reason: revocation.reason,
        revocationHash: hashBufferOrString(`${certId}:${revocation.reason}`),
      } : { isRevoked: false },
      templateId: defaultTemplate._id,
      pdfUrl: pdfResult.relativeUrl,
      qrCodeDataUrl,
      verificationUrl,
      verificationCount: Math.floor(Math.random() * 12) + 2,
    });

    return cert;
  }

  // 4. Seed Individual Certificates
  // Cert 0: Sarwpati Kumar's ServiceNow CSA Certificate (VALID)
  await createDemoCert({
    certId: 'VX-SNOW-2026-7842',
    recipient: {
      name: 'Sarwpati Kumar',
      email: 'sarwpati.kumar@iiitbh.ac.in',
      rollNumber: '220101099',
      department: 'Cloud Platform & Workflow Automation',
    },
    org: snowOrg,
    title: 'ServiceNow Certified System Administrator (CSA)',
    courseName: 'Enterprise Cloud Workflow Administration & Configuration',
    grade: 'Certified Professional',
    issueDate: '2026-06-24',
  });

  // Cert 1: Aarav's IIITBH Degree (VALID)
  await createDemoCert({
    certId: 'VX-IIITBH-2026-1001',
    recipient: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@iiitbh.ac.in',
      rollNumber: '220101001',
      department: 'Computer Science & Engineering',
    },
    org: iiitbhOrg,
    title: 'Bachelor of Technology in Computer Science & Engineering',
    courseName: 'Four-Year Undergraduate Degree Program',
    grade: '9.42 CGPA (First Class with Distinction)',
    issueDate: '2026-05-20',
  });

  // Cert 2: Aarav's Google Cloud Certification (VALID)
  await createDemoCert({
    certId: 'VX-GCA-2026-2002',
    recipient: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@iiitbh.ac.in',
      rollNumber: '220101001',
      department: 'Cloud Infrastructure Specialization',
    },
    org: gcaOrg,
    title: 'Google Cloud Certified Professional Cloud Architect',
    courseName: 'Enterprise Cloud Architecture & Distributed Systems',
    grade: 'Pass with Honors (Score: 98/100)',
    issueDate: '2026-03-10',
    expiryDate: '2029-03-10',
  });

  // Cert 3: Revoked Malpractice Certificate (REVOKED)
  await createDemoCert({
    certId: 'VX-IIITBH-2026-9999',
    recipient: {
      name: 'Vikram Mehra',
      email: 'vikram.mehra@fake.com',
      rollNumber: '220101099',
      department: 'Electronics & Communication',
    },
    org: iiitbhOrg,
    title: 'Bachelor of Technology in Electronics & Communication',
    courseName: 'Four-Year Undergraduate Degree Program',
    grade: '6.12 CGPA',
    status: 'revoked',
    revocation: {
      date: '2026-07-01',
      reason: 'Academic Integrity Violation: Fraudulent laboratory transcript submission detected during audit.',
    },
  });

  // Cert 4: Expired Certificate (EXPIRED)
  await createDemoCert({
    certId: 'VX-GCA-2024-8888',
    recipient: {
      name: 'Priya Singh',
      email: 'priya.singh@iiitbh.ac.in',
      rollNumber: '220101045',
      department: 'Cloud Solutions',
    },
    org: gcaOrg,
    title: 'Associate Cloud Engineer (3-Year Cycle)',
    courseName: 'Cloud Infrastructure & Kubernetes Basics',
    grade: 'Certified',
    issueDate: '2021-01-15',
    expiryDate: '2024-01-15',
    status: 'expired',
  });

  // 5. Seed Batch Merkle Tree Issuance (3 Graduating Students)
  const batchStudents = [
    { name: 'Priya Singh', email: 'priya.singh@iiitbh.ac.in', roll: '220101045', dept: 'Data Science & AI', grade: '9.65 CGPA' },
    { name: 'Rohan Verma', email: 'rohan.verma@iiitbh.ac.in', roll: '220101052', dept: 'Computer Science', grade: '8.90 CGPA' },
    { name: 'Ananya Gupta', email: 'ananya.gupta@iiitbh.ac.in', roll: '220101018', dept: 'Artificial Intelligence', grade: '9.35 CGPA' },
  ];

  const batchLeafHashes = [];
  const batchPayloads = [];
  const batchId = 'BATCH-IIITBH-GRAD2026';

  for (let i = 0; i < batchStudents.length; i++) {
    const s = batchStudents[i];
    const certId = `VX-IIITBH-2026-300${i + 1}`;
    const verificationUrl = `${clientBaseUrl}/verify/${certId}`;

    const canonicalPayload = {
      certificateId: certId,
      recipient: {
        name: s.name,
        email: s.email,
        rollNumber: s.roll,
        department: s.dept,
      },
      issuer: {
        orgId: iiitbhOrg._id.toString(),
        orgName: iiitbhOrg.name,
        orgCode: iiitbhOrg.code,
        keyId: iiitbhOrg.pki.keyId,
      },
      details: {
        title: `Bachelor of Technology in ${s.dept}`,
        courseName: 'Graduating Class of 2026',
        major: s.dept,
        gradeOrScore: s.grade,
        issueDate: '2026-06-01',
        expiryDate: null,
        description: `Batch Credential Issue - Batch Ref: ${batchId}`,
      },
    };

    const dataHash = hashObject(canonicalPayload);
    const signature = signPayload(canonicalPayload, iiitbhOrg.pki.privateKeyEncrypted);

    batchLeafHashes.push(dataHash);
    batchPayloads.push({
      certId,
      s,
      canonicalPayload,
      dataHash,
      signature,
      verificationUrl,
    });
  }

  const { tree, root: batchMerkleRoot } = buildMerkleTree(batchLeafHashes);

  for (const item of batchPayloads) {
    const proof = getMerkleProof(tree, item.dataHash);
    const qrCodeDataUrl = await generateQRCodeDataUrl(item.verificationUrl);

    const pdfResult = await generateCertificatePdf({
      certificateId: item.certId,
      recipient: item.canonicalPayload.recipient,
      issuer: item.canonicalPayload.issuer,
      details: item.canonicalPayload.details,
      crypto: { canonicalPayload: item.canonicalPayload, dataHash: item.dataHash, signature: item.signature },
      verificationUrl: item.verificationUrl,
    });

    await Certificate.create({
      certificateId: item.certId,
      recipient: item.canonicalPayload.recipient,
      issuer: item.canonicalPayload.issuer,
      details: item.canonicalPayload.details,
      crypto: {
        canonicalPayload: item.canonicalPayload,
        dataHash: item.dataHash,
        signature: item.signature,
        publicKeyUsed: iiitbhOrg.pki.publicKey,
        pdfHash: pdfResult.pdfHash,
        merkle: {
          isBatch: true,
          batchId,
          root: batchMerkleRoot,
          leafHash: item.dataHash,
          proof,
        },
      },
      status: 'valid',
      pdfUrl: pdfResult.relativeUrl,
      qrCodeDataUrl,
      verificationUrl: item.verificationUrl,
      verificationCount: 4,
    });
  }

  // 6. Seed Realistic Audit Logs
  await AuditLog.create([
    {
      action: 'ORGANIZATION_VERIFIED',
      orgId: iiitbhOrg._id,
      userId: adminUser._id,
      ipAddress: '10.0.4.12',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
      details: { orgName: iiitbhOrg.name, code: iiitbhOrg.code, keyId: iiitbhOrg.pki.keyId },
    },
    {
      action: 'CERTIFICATE_ISSUED',
      certificateId: 'VX-IIITBH-2026-1001',
      orgId: iiitbhOrg._id,
      userId: orgUser1._id,
      ipAddress: '172.16.20.5',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
      details: { recipient: 'Aarav Sharma', title: 'B.Tech CSE', keyId: iiitbhOrg.pki.keyId },
    },
    {
      action: 'BATCH_CERTIFICATES_ISSUED',
      orgId: iiitbhOrg._id,
      userId: orgUser1._id,
      ipAddress: '172.16.20.5',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
      details: { batchId, count: 3, merkleRoot: batchMerkleRoot },
    },
    {
      action: 'CERTIFICATE_REVOKED',
      certificateId: 'VX-IIITBH-2026-9999',
      orgId: iiitbhOrg._id,
      userId: orgUser1._id,
      ipAddress: '172.16.20.5',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'WARNING',
      details: { reason: 'Academic Integrity Violation' },
    },
    {
      action: 'CERTIFICATE_VERIFIED_ONLINE',
      certificateId: 'VX-IIITBH-2026-1001',
      orgId: iiitbhOrg._id,
      ipAddress: '192.0.2.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'SUCCESS',
      details: { verificationStatus: 'VALID', isSignatureValid: true },
    },
    {
      action: 'TAMPER_ATTEMPT_DETECTED',
      certificateId: 'VX-IIITBH-2026-1001',
      orgId: iiitbhOrg._id,
      ipAddress: '203.0.113.88',
      userAgent: 'PostmanRuntime/7.32.3',
      status: 'SECURITY_ALERT',
      details: {
        result: 'TAMPERED_PDF_FILE',
        reason: 'Binary stream or visual contents of the PDF were altered post-signing.',
      },
    },
  ]);

  console.log('[Seed] VerifyX Database successfully seeded with full PKI demo assets!');
}

// Allow running standalone or as imported function
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  require('dotenv').config();

  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
