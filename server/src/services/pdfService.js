const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { generateQRCodeBuffer } = require('./qrService');
const { hashBufferOrString } = require('../crypto/hasher');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads/certificates');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generates an industry-grade, tamper-evident PDF certificate
 */
async function generateCertificatePdf(certData, templateData = null) {
  // Landscape A4: 841.89 x 595.28 points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Embed standard fonts
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Colors
  const emeraldDark = rgb(0.02, 0.35, 0.22);
  const goldPrimary = rgb(0.79, 0.60, 0.15);
  const goldLight = rgb(0.95, 0.88, 0.70);
  const slateDark = rgb(0.08, 0.12, 0.19);
  const slateMuted = rgb(0.38, 0.45, 0.55);

  // 1. Draw Ornate Double Borders
  // Outer Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: goldPrimary,
    borderWidth: 3,
  });

  // Inner Border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: emeraldDark,
    borderWidth: 1.5,
  });

  // Corner Ornaments
  const cornerSize = 16;
  const corners = [
    [24, 24],
    [width - 24 - cornerSize, 24],
    [24, height - 24 - cornerSize],
    [width - 24 - cornerSize, height - 24 - cornerSize],
  ];
  corners.forEach(([cx, cy]) => {
    page.drawRectangle({
      x: cx,
      y: cy,
      width: cornerSize,
      height: cornerSize,
      color: goldLight,
      borderColor: goldPrimary,
      borderWidth: 1,
    });
  });

  // 2. Organization Header
  const orgName = certData.issuer.orgName || 'ACADEMIC INSTITUTION';
  const orgNameWidth = timesBold.widthOfTextAtSize(orgName.toUpperCase(), 22);
  page.drawText(orgName.toUpperCase(), {
    x: (width - orgNameWidth) / 2,
    y: height - 70,
    size: 22,
    font: timesBold,
    color: emeraldDark,
  });

  // Subtitle
  const subHeader = 'OFFICIAL CREDENTIAL OF MERIT & COMPLETION';
  const subWidth = helvetica.widthOfTextAtSize(subHeader, 9);
  page.drawText(subHeader, {
    x: (width - subWidth) / 2,
    y: height - 88,
    size: 9,
    font: helvetica,
    color: goldPrimary,
  });

  // 3. "Certificate of Excellence" Title
  const certTitle = certData.details.title || 'CERTIFICATE OF ACHIEVEMENT';
  const certTitleWidth = timesBold.widthOfTextAtSize(certTitle, 26);
  page.drawText(certTitle, {
    x: (width - certTitleWidth) / 2,
    y: height - 140,
    size: 26,
    font: timesBold,
    color: slateDark,
  });

  // Decorative divider line under title
  page.drawLine({
    start: { x: (width - 280) / 2, y: height - 150 },
    end: { x: (width + 280) / 2, y: height - 150 },
    thickness: 1.5,
    color: goldPrimary,
  });

  // 4. "This is proudly presented to"
  const presentText = 'This is to officially certify that';
  const presentWidth = timesItalic.widthOfTextAtSize(presentText, 14);
  page.drawText(presentText, {
    x: (width - presentWidth) / 2,
    y: height - 185,
    size: 14,
    font: timesItalic,
    color: slateMuted,
  });

  // 5. Recipient Name
  const recipientName = certData.recipient.name;
  const nameWidth = timesBold.widthOfTextAtSize(recipientName, 32);
  page.drawText(recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 230,
    size: 32,
    font: timesBold,
    color: emeraldDark,
  });

  // Underline under recipient name
  page.drawLine({
    start: { x: (width - Math.max(nameWidth, 300)) / 2 - 20, y: height - 238 },
    end: { x: (width + Math.max(nameWidth, 300)) / 2 + 20, y: height - 238 },
    thickness: 1,
    color: goldLight,
  });

  // 6. Course / Achievement Body Text
  const degreeText = certData.details.courseName || certData.details.major || 'Distinction & High Merit';
  const bodyLine1 = `has successfully fulfilled all requirements and demonstrated excellence in`;
  const body1Width = timesRoman.widthOfTextAtSize(bodyLine1, 13);
  page.drawText(bodyLine1, {
    x: (width - body1Width) / 2,
    y: height - 275,
    size: 13,
    font: timesRoman,
    color: slateDark,
  });

  const degreeWidth = timesBold.widthOfTextAtSize(degreeText, 16);
  page.drawText(degreeText, {
    x: (width - degreeWidth) / 2,
    y: height - 305,
    size: 16,
    font: timesBold,
    color: slateDark,
  });

  // Roll Number & Grade Details
  const rollText = certData.recipient.rollNumber ? `Roll No / Student ID: ${certData.recipient.rollNumber}` : '';
  const gradeText = certData.details.gradeOrScore ? `Grade / CGPA: ${certData.details.gradeOrScore}` : '';
  const metaDetail = [rollText, gradeText].filter(Boolean).join('  |  ');
  if (metaDetail) {
    const metaWidth = helvetica.widthOfTextAtSize(metaDetail, 11);
    page.drawText(metaDetail, {
      x: (width - metaWidth) / 2,
      y: height - 335,
      size: 11,
      font: helvetica,
      color: slateMuted,
    });
  }

  // 7. QR Code Embedding
  const verificationUrl = certData.verificationUrl || `http://localhost:5173/verify/${certData.certificateId}`;
  const qrBuffer = await generateQRCodeBuffer(verificationUrl);
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrDim = 95;
  page.drawImage(qrImage, {
    x: width - 150,
    y: 75,
    width: qrDim,
    height: qrDim,
  });

  // QR Label
  page.drawText('Scan to Verify Authenticity', {
    x: width - 158,
    y: 62,
    size: 7.5,
    font: helveticaBold,
    color: emeraldDark,
  });

  // 8. Signatories & Dates (Left & Center Bottom)
  // Date of Issuance
  const issueDateStr = new Date(certData.details.issueDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  page.drawText(`Date of Issuance: ${issueDateStr}`, {
    x: 60,
    y: 110,
    size: 11,
    font: timesRoman,
    color: slateDark,
  });

  page.drawText(`Certificate ID: ${certData.certificateId}`, {
    x: 60,
    y: 90,
    size: 10,
    font: courier,
    color: emeraldDark,
  });

  // Signatory Line
  page.drawLine({
    start: { x: (width / 2) - 80, y: 100 },
    end: { x: (width / 2) + 80, y: 100 },
    thickness: 1,
    color: slateDark,
  });
  page.drawText('Authorized Signatory', {
    x: (width / 2) - 52,
    y: 84,
    size: 10,
    font: timesBold,
    color: slateDark,
  });
  page.drawText(orgName, {
    x: (width / 2) - (timesItalic.widthOfTextAtSize(orgName, 8.5) / 2),
    y: 70,
    size: 8.5,
    font: timesItalic,
    color: slateMuted,
  });

  // 9. Bottom Cryptographic Security Strip
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: 22,
    color: rgb(0.96, 0.97, 0.98),
  });

  const cryptoStrip = `[VERIFYX PKI SECURITY] SHA-256: ${certData.crypto.dataHash.substring(0, 20)}... | Ed25519 Sig: ${certData.crypto.signature.substring(0, 18)}... | KeyID: ${certData.crypto.canonicalPayload?.issuer?.keyId || certData.issuer.keyId}`;
  page.drawText(cryptoStrip, {
    x: 36,
    y: 35,
    size: 7,
    font: courier,
    color: slateMuted,
  });

  // 10. Embed PDF Metadata
  pdfDoc.setTitle(`VerifyX Certificate - ${certData.certificateId}`);
  pdfDoc.setAuthor(orgName);
  pdfDoc.setSubject(`Digital Credential for ${recipientName}`);
  pdfDoc.setKeywords(['VerifyX', 'Cryptographic-Credential', 'Ed25519', 'Tamper-Evident', certData.certificateId]);
  pdfDoc.setProducer('VerifyX Cryptographic Issuance Engine v1.0');
  pdfDoc.setCreationDate(new Date());

  // Save PDF to buffer
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  // Compute PDF file SHA-256 hash
  const pdfHash = hashBufferOrString(pdfBuffer);

  // Write file to disk
  const fileName = `${certData.certificateId}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return {
    pdfBuffer,
    pdfHash,
    fileName,
    relativeUrl: `/uploads/certificates/${fileName}`,
    absolutePath: filePath,
  };
}

module.exports = {
  generateCertificatePdf,
};
