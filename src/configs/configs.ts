import 'dotenv/config';
import { z } from 'zod';

import { ENV } from './load-env.js';

/**
 * @file configs.ts
 * @description
 * Defines and validates the minimal set of environment variables
 * required by the `truehear-shared` SDK.
 *
 * This configuration module focuses only on SDK-level needs such as
 * encryption keys and runtime environment. It intentionally omits any
 * backend- or service-specific configuration like databases or APIs.
 *
 * Key design principles:
 *  - Validates required variables using Zod at load time.
 *  - Fails fast and clearly if values are missing or malformed.
 *  - Produces a single immutable `configs` object for SDK-wide use.
 *  - Safe to import anywhere in producer or consumer applications.
 */

/* --------------------------------------------------------------------------
 * Schema Definition
 * -------------------------------------------------------------------------- */

/**
 * Zod schema describing the minimal set of environment variables required
 * for this SDK to operate securely.
 *
 * AES_SECRET_KEY: 64-character hex string (32 bytes) for AES-256-CBC.
 * AES_IV:         32-character hex string (16 bytes) for AES-256-CBC.
 * ENVIRONMENT:    Deployment environment; defaults to "development".
 */
const SharedEnvSchema = z.object({
  AES_SECRET_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/, {
      message: 'AES_SECRET_KEY must be a 64-character hex string (32 bytes',
    })
    .describe('Hex-encoded 256-bit key for AES-256-CBC encryption')
    .optional(),
  AES_IV: z
    .string()
    .regex(/^[a-fA-F0-9]{32}$/, {
      message: 'AES_IV must be a 32-character hex string (16 bytes)',
    })
    .describe('Hex-encoded 128-bit IV for AES-256-CBC encryption')
    .optional(),
  ENVIRONMENT: z.enum(['development', 'test', 'staging', 'production']).default('development'),
});

/* --------------------------------------------------------------------------
 * Validation
 * -------------------------------------------------------------------------- */

/**
 * Validate the current process environment against the schema.
 * This runs immediately when the module is imported.
 *
 * If validation fails, a detailed error is printed and an exception is thrown.
 * This ensures the SDK fails fast rather than silently misconfiguring itself.
 */
const parsed = SharedEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\nInvalid environment configuration for truehear-shared SDK:\n');
  console.error(parsed.error.format());
  throw new Error(
    [
      'Missing or invalid environment variables for truehear-shared SDK.',
      'Ensure your `.env` file includes valid values:',
      '  AES_SECRET_KEY=<64 hex characters>',
      '  AES_IV=<32 hex characters>',
    ].join('\n')
  );
}

// print in dev/test mode only
if (process.env.NODE_ENV !== 'production') {
  console.debug('[truehear-shared] Loaded environment:', parsed.data.ENVIRONMENT);
}
/* --------------------------------------------------------------------------
 * Canonical Configuration Object
 * -------------------------------------------------------------------------- */

/**
 * Canonical, immutable configuration object used throughout the SDK.
 *
 * Exposes normalized environment flags for convenience (IS_DEV, IS_PROD, etc.)
 * and prevents mutation at runtime using Object.freeze().
 */
export const configs = Object.freeze({
  AES_SECRET_KEY: parsed.data.AES_SECRET_KEY,
  AES_IV: parsed.data.AES_IV,
  ENVIRONMENT: parsed.data.ENVIRONMENT,
  IS_DEV: parsed.data.ENVIRONMENT === 'development',
  IS_PROD: parsed.data.ENVIRONMENT === 'production',
  IS_TEST: parsed.data.ENVIRONMENT === 'test',
  IS_STAGING: parsed.data.ENVIRONMENT === 'staging',
  ENV: { ...ENV },
});

/* --------------------------------------------------------------------------
 * Type Exports
 * -------------------------------------------------------------------------- */

/**
 * Type representing the shape of the shared SDK configuration.
 * Useful for IntelliSense and when passing the config to other modules.
 */
export type SharedConfig = typeof configs;

/**
 * Default export for convenience.
 * Import as:
 *   import configs from '@truehear/shared/configs';
 */
export default configs;
