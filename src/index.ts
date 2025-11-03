/**
 * @file index.ts
 * @description
 * Main entry point for the Shared SDK.
 *
 * This SDK provides:
 *   - Centralized configuration and environment validation
 *   - Shared services (e.g. encryption utilities)
 *   - Optional logger (if needed for unified diagnostics)
 *
 * The SDK is designed to be stateless, idempotent, and safe to import
 * in any service — producer or consumer — without side effects.
 */

// -----------------------------------------------------------------------------
// 1. Load environment variables early
// -----------------------------------------------------------------------------

// This ensures .env is read before any service or model that depends on it.
// Safe to call multiple times — dotenv handles internal caching.
import './configs/load-env.js';

// -----------------------------------------------------------------------------
// 2. Export validated configuration
// -----------------------------------------------------------------------------

// Provides access to validated AES keys, environment, etc.
// Example:
//   import { configs } from '@sameer/shared';
//   console.log(configs.ENVIRONMENT);
export * from './configs/configs.js';

// -----------------------------------------------------------------------------
// 3. Export shared logger (optional component)
// -----------------------------------------------------------------------------

// The logger is optional but commonly used across producer and consumer services
// for consistent structured logging.
export * from './logger/logger.js';

// -----------------------------------------------------------------------------
// 4. Export shared service utilities
// -----------------------------------------------------------------------------

// Export both the pre-configured singleton (encryptionService)
// and the raw EncryptionService class for custom instantiation.
export * from './services/encryption.service.js';
export * from './services/index.js';
