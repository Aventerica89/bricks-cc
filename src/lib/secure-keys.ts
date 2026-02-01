import { encrypt, decrypt, safeEncrypt, safeDecrypt } from "./crypto";

/**
 * Helper functions for encrypting/decrypting API keys
 * Use these when storing/retrieving sensitive keys from database
 */

/**
 * Encrypt an API key before storing in database
 */
export function encryptApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey) return null;
  return safeEncrypt(apiKey);
}

/**
 * Decrypt an API key retrieved from database
 */
export function decryptApiKey(encryptedKey: string | null | undefined): string | null {
  if (!encryptedKey) return null;
  return safeDecrypt(encryptedKey);
}

/**
 * Encrypt Basecamp OAuth token
 */
export function encryptBasecampToken(token: string | null | undefined): string | null {
  if (!token) return null;
  return safeEncrypt(token);
}

/**
 * Decrypt Basecamp OAuth token
 */
export function decryptBasecampToken(encryptedToken: string | null | undefined): string | null {
  if (!encryptedToken) return null;
  return safeDecrypt(encryptedToken);
}

/**
 * Encrypt Bricks API key
 */
export function encryptBricksApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey) return null;
  return safeEncrypt(apiKey);
}

/**
 * Decrypt Bricks API key
 */
export function decryptBricksApiKey(encryptedKey: string | null | undefined): string | null {
  if (!encryptedKey) return null;
  return safeDecrypt(encryptedKey);
}
