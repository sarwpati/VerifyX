/**
 * RFC 8785: JSON Canonicalization Scheme (JCS)
 * Canonicalizes JSON objects into deterministic string representations
 * ensuring consistent cryptographic hashes across different platforms and runtimes.
 */

function canonicalize(object) {
  if (object === null || typeof object !== 'object') {
    return JSON.stringify(object);
  }

  if (Array.isArray(object)) {
    const elements = object.map((item) => canonicalize(item));
    return `[${elements.join(',')}]`;
  }

  const keys = Object.keys(object).sort();
  const pairs = keys.map((key) => {
    const val = canonicalize(object[key]);
    return `${JSON.stringify(key)}:${val}`;
  });

  return `{${pairs.join(',')}}`;
}

module.exports = { canonicalize };
