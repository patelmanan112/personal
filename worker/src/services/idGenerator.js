// worker/src/services/idGenerator.js
// Generates unique UALG membership IDs in the format: UALG-YYYY-XXXXXX

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 to avoid confusion

/**
 * Generates a cryptographically random alphanumeric suffix.
 */
function randomSuffix(length = 6) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join('');
}

/**
 * Generates a candidate ID: UALG-YYYY-XXXXXX
 */
export function generateCandidateId() {
  const year = new Date().getFullYear();
  const suffix = randomSuffix(6);
  return `UALG-${year}-${suffix}`;
}

/**
 * Generates a unique membership ID by checking MongoDB for collisions.
 * Retries up to maxAttempts times.
 */
export async function generateUniqueId(collection, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidateId = generateCandidateId();
    const existing = await collection.findOne({ uniqueId: candidateId });
    if (!existing) {
      return candidateId;
    }
  }
  throw new Error('Failed to generate a unique ID after maximum attempts. Please try again.');
}
