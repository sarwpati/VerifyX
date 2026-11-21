const crypto = require('crypto');
const { canonicalize } = require('./canonicalizer');

/**
 * Generates an Ed25519 asymmetric cryptographic keypair for an organization.
 * Ed25519 offers high security (128-bit security level) with short 32-byte keys and fast signature verification.
 */
function generateOrgKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Also extract raw hex fingerprints for human-readable display
  const keyId = crypto.createHash('sha256').update(publicKey).digest('hex').substring(0, 16);

  return {
    publicKey,
    privateKey,
    keyId,
    algorithm: 'Ed25519',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Digitally signs a canonical certificate payload using the issuer's private key.
 */
function signPayload(payload, privateKeyPem) {
  const canonicalData = canonicalize(payload);
  const dataBuffer = Buffer.from(canonicalData, 'utf8');

  // Ed25519 signing in Node.js (algorithm is null for ed25519)
  const signature = crypto.sign(null, dataBuffer, privateKeyPem);
  return signature.toString('base64');
}

/**
 * Mathematically verifies an Ed25519 digital signature against the canonical payload and public key.
 */
function verifySignature(payload, signatureBase64, publicKeyPem) {
  try {
    const canonicalData = canonicalize(payload);
    const dataBuffer = Buffer.from(canonicalData, 'utf8');
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');

    return crypto.verify(null, dataBuffer, publicKeyPem, signatureBuffer);
  } catch (err) {
    console.error('[PKI Engine] Verification error:', err.message);
    return false;
  }
}

module.exports = {
  generateOrgKeyPair,
  signPayload,
  verifySignature,
};
