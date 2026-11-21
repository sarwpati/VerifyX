const QRCode = require('qrcode');

/**
 * Generates a QR Code as a Data URL (base64 image)
 */
async function generateQRCodeDataUrl(verificationUrl) {
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('[QR Service] Failed to generate QR DataURL:', err.message);
    throw err;
  }
}

/**
 * Generates a QR Code as a PNG Buffer
 */
async function generateQRCodeBuffer(verificationUrl) {
  try {
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrBuffer;
  } catch (err) {
    console.error('[QR Service] Failed to generate QR Buffer:', err.message);
    throw err;
  }
}

module.exports = {
  generateQRCodeDataUrl,
  generateQRCodeBuffer,
};
