import crypto from 'crypto';
import { apiConfig } from '../config/apiConfig';

const IV_LENGTH = 16; // AES block size
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY_HEX = apiConfig.secrets.COOKIE_ENCRYPTION_KEY;

// Convert hex key to Buffer
const SECRET_KEY = Buffer.from(SECRET_KEY_HEX, 'hex');

// Ensure key is 32 bytes (256 bits)
if (SECRET_KEY.length !== 32) {
  throw new Error('COOKIE_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

/**
 * Encrypts a token using AES-256-CBC.
 * Returns the IV and ciphertext in the format: iv:encryptedData
 */
export const encryptToken = (token: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Decrypts an encrypted token back to plain text.
 * Expects input format: iv:encryptedData
 */
export const decryptToken = (encryptedToken: string): string => {
  const [ivHex, encryptedHex] = encryptedToken.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted token format');

  const iv = Buffer.from(ivHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString('utf8');
};
