/**
 * @file src/services/index.ts
 * @description
 * Central export point for cryptography utilities within the shared SDK.
 *
 * This file exposes both:
 *   1. The flexible, environment-aware {@link encryptionService} proxy instance.
 *   2. Lifecycle management utilities such as {@link initEncryptionService}, {@link getEncryptionService}, and {@link resetEncryptionService}.
 *
 * The encryption layer automatically supports:
 *   - Lazy initialization from environment variables (`AES_SECRET_KEY`, `AES_IV`)
 *   - Explicit manual initialization (via factory methods)
 *   - Fault-tolerant fallback (no crash if keys are missing)
 *
 * Developers can safely import and use `encryptionService.encrypt()` even if
 * environment variables are not yet loaded — errors will only be thrown
 * when encryption is actually attempted.
 */

export * from './encryption.service.js';
export * from './encryption.factory.js';
