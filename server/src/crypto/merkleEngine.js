const { MerkleTree } = require('merkletreejs');
const crypto = require('crypto');

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * Builds a Merkle Tree from an array of leaf hashes (hex strings or strings)
 */
function buildMerkleTree(leafHashes) {
  if (!leafHashes || leafHashes.length === 0) {
    throw new Error('Cannot build Merkle Tree with empty leaves');
  }

  // Ensure leaves are SHA-256 buffers
  const leaves = leafHashes.map((leaf) => Buffer.from(leaf, 'hex'));
  const tree = new MerkleTree(leaves, sha256, { sortPairs: true });

  const root = tree.getRoot().toString('hex');
  const leafCount = leaves.length;

  return {
    tree,
    root,
    leafCount,
  };
}

/**
 * Generates Merkle inclusion proof for a specific leaf
 */
function getMerkleProof(tree, leafHash) {
  const leafBuffer = Buffer.from(leafHash, 'hex');
  const proof = tree.getHexProof(leafBuffer);
  return proof;
}

/**
 * Verifies if a given leaf is part of the Merkle Tree with the specified root
 */
function verifyMerkleProof(proof, leafHash, rootHex) {
  try {
    const leafBuffer = Buffer.from(leafHash, 'hex');
    const rootBuffer = Buffer.from(rootHex, 'hex');
    return MerkleTree.verify(proof, leafBuffer, rootBuffer, sha256, { sortPairs: true });
  } catch (err) {
    console.error('[Merkle Engine] Verification failed:', err.message);
    return false;
  }
}

module.exports = {
  buildMerkleTree,
  getMerkleProof,
  verifyMerkleProof,
};
