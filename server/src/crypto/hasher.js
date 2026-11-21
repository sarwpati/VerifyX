const crypto = require('crypto');
const { canonicalize } = require('./canonicalizer');

/**
 * Generates SHA-256 hash of a canonicalized object
 */
function hashObject(obj) {
  const canonicalJson = canonicalize(obj);
  return crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
}

/**
 * Generates SHA-256 hash of a string or buffer
 */
function hashBufferOrString(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = {
  hashObject,
  hashBufferOrString,
};
