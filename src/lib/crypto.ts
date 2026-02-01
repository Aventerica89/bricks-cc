import crypto from "crypto";

/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment
 * In production, use a secure 32-byte key (64 hex characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // Development fallback (NOT for production)
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY is required in production. Generate with: openssl rand -hex 32"
      );
    }
    console.warn(
      "Warning: Using default encryption key. Set ENCRYPTION_KEY in production!"
    );
    return Buffer.from("0".repeat(64), "hex"); // 32 bytes
  }

  // Convert hex string to buffer
  if (key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate with: openssl rand -hex 32"
    );
  }

  return Buffer.from(key, "hex");
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64-encoded string in format: iv:authTag:encrypted
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error("Cannot encrypt empty string");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (all hex-encoded)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a string encrypted with encrypt()
 * Expects format: iv:authTag:encrypted
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error("Cannot decrypt empty string");
  }

  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a string appears to be encrypted
 * (has the expected format: hex:hex:hex)
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;

  const parts = data.split(":");
  if (parts.length !== 3) return false;

  // Check if all parts are valid hex
  const hexRegex = /^[0-9a-f]+$/i;
  return parts.every((part) => hexRegex.test(part));
}

/**
 * Safely encrypt (handles already-encrypted data)
 */
export function safeEncrypt(data: string): string {
  if (isEncrypted(data)) {
    return data; // Already encrypted
  }
  return encrypt(data);
}

/**
 * Safely decrypt (handles plain text)
 */
export function safeDecrypt(data: string): string {
  if (!isEncrypted(data)) {
    return data; // Not encrypted, return as-is
  }
  return decrypt(data);
}
