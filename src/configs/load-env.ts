import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @file load-env.ts
 * @module config/load-env
 *
 * @description
 * Loads environment variables from a `.env` file automatically.
 * - Safe to call multiple times (dotenv ignores duplicates)
 * - Ensures `.env` is loaded before other SDK modules (like logger)
 * - Supports loading from the current working directory or SDK root
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(process.cwd(), '.env');

// Load only once; dotenv handles caching internally
dotenv.config({ path: envPath });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'production',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  SERVICE_NAME: process.env.SERVICE_NAME ?? 'truehear-service',
  LOG_REDACT_KEYS: process.env.LOG_REDACT_KEYS ?? '',
};
