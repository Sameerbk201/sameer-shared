/**
 * @file encryption.service.test.ts
 * @description
 * Comprehensive unit tests for {@link EncryptionService}.
 *
 * Ensures correct AES-256-CBC encryption/decryption and SHA-256 hashing behavior.
 * All tests use deterministic keys and IVs for reproducibility.
 *
 * @module tests/unit/encryption.service.test
 */

import { describe, it, expect } from 'vitest';

import { EncryptionService } from '../../services/encryption.service.js';

/**
 * Test constants:
 *  - Keys are fixed hex strings for deterministic output.
 *  - NEVER use these in production; generate secure random keys instead.
 */
const SECRET_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64 hex chars (32 bytes)
const IV = 'abcdef9876543210abcdef9876543210'; // 32 hex chars (16 bytes)

// Instantiate service once for all tests
const service = new EncryptionService({ secretKey: SECRET_KEY, iv: IV });

describe('EncryptionService', () => {
  /** Basic sanity checks */
  it('should instantiate correctly with valid key and iv', () => {
    expect(service).toBeInstanceOf(EncryptionService);
  });

  /** Encryption/Decryption round-trip */
  it('should correctly encrypt and decrypt plaintext', () => {
    const plaintext = 'SensitiveMessage123!';
    const ciphertext = service.encrypt(plaintext);

    // Ensure ciphertext is not the same as plaintext
    expect(ciphertext).not.toBe(plaintext);
    expect(typeof ciphertext).toBe('string');
    expect(ciphertext).toMatch(/^[0-9a-f]+$/);

    const decrypted = service.decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  /** Verify deterministic decryption */
  it('should decrypt to the same plaintext when given identical ciphertext', () => {
    const plaintext = 'repeatable-test';
    const ciphertext = service.encrypt(plaintext);
    const decrypted1 = service.decrypt(ciphertext);
    const decrypted2 = service.decrypt(ciphertext);
    expect(decrypted1).toBe(decrypted2);
    expect(decrypted1).toBe(plaintext);
  });

  /** Validate hashing behavior */
  it('should create deterministic SHA-256 hashes', () => {
    const input = 'my-secret';
    const hash1 = service.hash(input);
    const hash2 = service.hash(input);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  /** Ensure different inputs produce different hashes */
  it('should produce distinct hashes for different inputs', () => {
    const hashA = service.hash('A');
    const hashB = service.hash('B');
    expect(hashA).not.toBe(hashB);
  });

  /** Failure scenarios */
  it('should throw when constructed with invalid key/iv', () => {
    expect(() => new EncryptionService({ secretKey: '1234', iv: 'abcd' })).toThrow(/requires/);
  });

  it('should throw on decryption with corrupted ciphertext', () => {
    const invalidCipher = 'deadbeef';
    expect(() => service.decrypt(invalidCipher)).toThrow(/Decryption failed/);
  });
});
