import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY; // Must be 32-byte hex string in env

function getKey() {
  if (!KEY) {
    console.warn('[ENCRYPTION] ENCRYPTION_KEY not set — PII fields will be stored unencrypted');
    return null;
  }
  return Buffer.from(KEY, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64 string in the format: iv:authTag:ciphertext
 */
export function encrypt(plaintext) {
  const key = getKey();
  if (!key || !plaintext) return plaintext;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a base64 string previously encrypted with encrypt().
 */
export function decrypt(ciphertext) {
  const key = getKey();
  if (!key || !ciphertext) return ciphertext;
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext; // Not encrypted
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const data = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[ENCRYPTION] Decryption failed:', err.message);
    return '[ENCRYPTED]';
  }
}

/**
 * Hash data with SHA-256.
 */
export function hash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
