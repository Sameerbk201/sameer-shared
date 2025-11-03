import crypto from 'crypto';

/**
 * AES-256-CBC reversible encryption + SHA-256 hashing utility.
 * Provides standardized encryption/decryption and hashing for sensitive fields.
 */

export interface EncryptionServiceOptions {
  /** Hex-encoded 256-bit key (32 bytes → 64 hex chars) */
  secretKey: string;
  /** Hex-encoded 128-bit IV (16 bytes → 32 hex chars) */
  iv: string;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey: Buffer;
  private readonly iv: Buffer;

  constructor(options: EncryptionServiceOptions) {
    const { secretKey, iv } = options;

    if (!secretKey || !iv) {
      throw new Error('EncryptionService requires secretKey and iv');
    }

    this.secretKey = Buffer.from(secretKey, 'hex');
    this.iv = Buffer.from(iv, 'hex');

    if (this.secretKey.length !== 32) {
      throw new Error('AES-256 requires a 32-byte secret key (64 hex chars)');
    }
    if (this.iv.length !== 16) {
      throw new Error('AES-256-CBC requires a 16-byte IV (32 hex chars)');
    }
  }

  /**
   * Encrypt plaintext into hex ciphertext.
   * @param plaintext Input string to encrypt.
   * @returns Hex-encoded ciphertext.
   */
  encrypt(plaintext: string): string {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (err) {
      throw new Error(`Encryption failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Decrypt hex ciphertext back to plaintext.
   * @param ciphertext Hex-encoded ciphertext.
   * @returns UTF-8 plaintext string.
   */
  decrypt(ciphertext: string): string {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, this.iv);
      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      throw new Error(`Decryption failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Creates a SHA-256 hash of the input.
   * Useful for search/indexing without storing plaintext.
   * @param value Input string to hash.
   * @returns Hex-encoded SHA-256 hash.
   */
  hash(value: string): string {
    try {
      return crypto.createHash('sha256').update(value).digest('hex');
    } catch (err) {
      throw new Error(`Hashing failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
