import configs from '../configs/configs.js';
import { EncryptionService } from './encryption.service.js';

/**
 * Singleton instance of EncryptionService, initialized from environment configs.
 *
 * This instance is intended for SDK-wide use (e.g., model encryption, email hashing).
 *
 * Consumers may still create their own instances of EncryptionService
 * if they need alternate keys or different crypto policies.
 */
export const encryptionService = new EncryptionService({
  secretKey: configs.AES_SECRET_KEY ?? '',
  iv: configs.AES_IV ?? '',
});

// Re-export the class for flexibility
export * from './encryption.service.js';
