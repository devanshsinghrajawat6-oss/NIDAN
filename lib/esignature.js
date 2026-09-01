import crypto from 'crypto';

/**
 * Electronic Signature utility — GCP-ASU / 21 CFR Part 11 aligned.
 * Creates HMAC-SHA256 signatures over critical clinical records.
 */

const SECRET = process.env.ESIGNATURE_SECRET || 'nidana-ctms-esig-secret';

/**
 * Create an e-signature for a clinical record.
 * @param {string} userId - ID of the signing user
 * @param {string} userRole - Role of the signing user
 * @param {string} recordId - ID of the record being signed
 * @param {string} recordHash - SHA-256 hash of the record data
 * @param {string} action - Action being performed (e.g., 'CONSENT', 'SAE_REPORT')
 * @returns {object} Signature object with signature, timestamp, and metadata
 */
export function createSignature(userId, userRole, recordId, recordHash, action) {
  const timestamp = new Date().toISOString();
  const payload = `${userId}|${userRole}|${recordId}|${recordHash}|${action}|${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  return {
    signature,
    userId,
    userRole,
    recordId,
    action,
    timestamp,
    algorithm: 'HMAC-SHA256'
  };
}

/**
 * Verify an e-signature.
 */
export function verifySignature(sigObject, recordHash) {
  const payload = `${sigObject.userId}|${sigObject.userRole}|${sigObject.recordId}|${recordHash}|${sigObject.action}|${sigObject.timestamp}`;
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(sigObject.signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
