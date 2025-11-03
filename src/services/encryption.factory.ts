/**
 * @file encryption.factory.ts
 * @description
 * Factory and lifecycle management utilities for {@link EncryptionService}.
 *
 * Provides an SDK-friendly, fault-tolerant initialization model:
 *   - Supports lazy initialization from environment variables.
 *   - Allows explicit runtime configuration via {@link initEncryptionService}.
 *   - Prevents crashes during import when keys are missing.
 *   - Logs helpful messages and throws descriptive runtime errors only when needed.
 *
 * This pattern mirrors the initialization style of SDKs like Stripe, AWS, and Firebase —
 * ensuring compatibility with CI environments, tests, and serverless functions.
 */

import configs from '../configs/configs.js';
import { EncryptionService } from './encryption.service.js';
import type { EncryptionServiceOptions } from './encryption.service.js';
import { logger } from '../logger/logger.js';

/**
 * Internal singleton reference.
 * May be null if encryption has not been configured yet.
 */
let instance: EncryptionService | null = null;

/* -----------------------------------------------------------------------------
 * Initialization
 * ----------------------------------------------------------------------------- */

/**
 * Initializes (or re-initializes) the global {@link EncryptionService} singleton.
 *
 * @remarks
 * This method can be called multiple times — subsequent calls will override
 * the previous instance with new keys.
 *
 * If no valid keys are provided (either via arguments or environment variables),
 * the SDK will log a warning and disable encryption until initialized.
 *
 * @example
 * ```ts
 * // Initialize explicitly at startup
 * initEncryptionService({
 *   secretKey: process.env.AES_SECRET_KEY!,
 *   iv: process.env.AES_IV!,
 * });
 * ```
 *
 * @param options - Optional override for secretKey and IV.
 */
export function initEncryptionService(options?: Partial<EncryptionServiceOptions>): void {
  const secretKey = options?.secretKey ?? configs.AES_SECRET_KEY;
  const iv = options?.iv ?? configs.AES_IV;

  if (!secretKey || !iv) {
    logger.warn(
      '[shared] EncryptionService not configured — encryption and decryption features disabled until initialized.'
    );
    instance = null;
    return;
  }

  instance = new EncryptionService({ secretKey, iv });
  logger.info('[shared] EncryptionService initialized successfully.');
}

/* -----------------------------------------------------------------------------
 * Accessor
 * ----------------------------------------------------------------------------- */

/**
 * Retrieves the active {@link EncryptionService} instance.
 *
 * If the service has not been explicitly initialized but valid environment
 * variables exist, this method will lazily create an instance using those.
 *
 * If neither configuration nor environment keys are available, a descriptive
 * error is thrown when you attempt to use encryption methods.
 *
 * @example
 * ```ts
 * // Typical usage (auto-initializes from .env)
 * const encryption = getEncryptionService();
 * const ciphertext = encryption.encrypt('SensitiveData');
 * ```
 *
 * @throws Error if the service cannot be initialized due to missing configuration.
 * @returns The configured {@link EncryptionService} instance.
 */
export function getEncryptionService(): EncryptionService {
  if (instance) return instance;

  const { AES_SECRET_KEY, AES_IV } = configs;

  if (AES_SECRET_KEY && AES_IV) {
    instance = new EncryptionService({ secretKey: AES_SECRET_KEY, iv: AES_IV });
    logger.debug('[shared] EncryptionService lazily initialized from environment variables.');
    return instance;
  }

  throw new Error(
    '[shared] EncryptionService not initialized. ' +
      'Call initEncryptionService() manually or set AES_SECRET_KEY/AES_IV in the environment.'
  );
}

/* -----------------------------------------------------------------------------
 * Helpers and Shortcuts
 * ----------------------------------------------------------------------------- */

/**
 * Checks whether the {@link EncryptionService} is currently initialized.
 *
 * @returns true if initialized; otherwise false.
 */
export function isEncryptionServiceReady(): boolean {
  return instance !== null;
}

/**
 * Resets the singleton instance to an uninitialized state.
 * Intended primarily for testing or controlled reconfiguration.
 *
 * @example
 * ```ts
 * // Reset between integration tests
 * resetEncryptionService();
 * ```
 */
export function resetEncryptionService(): void {
  instance = null;
  logger.debug('[shared] EncryptionService instance reset.');
}

/**
 * Convenience export for developers who prefer property-style access.
 * Will throw if accessed before initialization.
 *
 * @example
 * ```ts
 * import { encryptionService } from '@sameer/shared';
 * encryptionService.encrypt('message');
 * ```
 */
export const encryptionService: EncryptionService = new Proxy({} as EncryptionService, {
  get(_, prop: keyof EncryptionService) {
    const service =
      instance ??
      (() => {
        // Try to lazily initialize if possible
        const { AES_SECRET_KEY, AES_IV } = configs;
        if (AES_SECRET_KEY && AES_IV) {
          instance = new EncryptionService({ secretKey: AES_SECRET_KEY, iv: AES_IV });
          logger.debug('[shared] EncryptionService auto-initialized from environment.');
          return instance;
        }

        throw new Error(
          `[shared] EncryptionService accessed before initialization — cannot call "${String(
            prop
          )}". Please call initEncryptionService() or set AES_SECRET_KEY/AES_IV first.`
        );
      })();

    const value = service[prop];
    if (typeof value === 'function') return value.bind(service);
    return value;
  },
});
