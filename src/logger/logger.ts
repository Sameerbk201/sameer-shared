import '../configs/load-env.js';
import { createRequire } from 'module';
import path from 'node:path';

import pino, { stdTimeFunctions } from 'pino';
import type { TransportTargetOptions, Logger, LoggerOptions } from 'pino';

const require = createRequire(import.meta.url);
/**
 * @file Logger
 * @module logger
 *
 * @description
 * High-performance, production-only structured logger for all sameer Cloud services.
 *
 * ---
 * ## Key Capabilities
 * - JSON structured logging for observability pipelines (ELK, Loki, Datadog, etc.)
 * - Custom log levels (`trace`, `debug`, `info`, `warn`, `error`, `fatal`)
 * - Context-aware child loggers via `createLogger(context)`
 * - Data redaction for sensitive keys
 * - Custom serializers for `req`, `res`, and `err`
 * - Auto ISO-timestamping
 * - Safe “silent mode” for tests
 * - Fully TypeScript-typed (using `LoggerOptions`)
 *
 * ---
 * ## Environment variables
 * | Variable | Description | Default |
 * |-----------|--------------|----------|
 * | `LOG_LEVEL` | Minimum log level | `info` |
 * | `NODE_ENV` | Should be `production` in deployed environments | `production` |
 * | `LOG_REDACT_KEYS` | Comma-separated keys to redact (e.g. `password,token`) | _(none)_ |
 *
 * ---
 * ## Usage Examples
 *
 * ```ts
 * import { logger, createLogger } from '@sameer/shared';
 *
 * 1 Basic logging
 * logger.info('Service started');
 * logger.error({ err }, 'Unhandled exception');
 *
 * 2 Scoped logger (per service/module)
 * const authLogger = createLogger({ service: 'auth-api' });
 * authLogger.warn('User token expired');
 *
 * 3 Structured event with metadata
 * logger.info({ event: 'USER_SIGNUP', tenantId: 't1', userId: 'u42' });
 *
 * 4 Error object serialization
 * try {
 *   throw new Error('Database connection failed');
 * } catch (err) {
 *   logger.error({ err }, 'Fatal DB error');
 * }
 * ```
 *
 * ---
 * ## Notes
 * - Avoid console.log — always use this logger for structured output.
 * - Redact sensitive data via `LOG_REDACT_KEYS` (comma-separated list).
 * - Integrate with centralized log ingestion systems using JSON output.
 */

/* -----------------------------------------------------------------------------
 * Redaction Setup
 * ---------------------------------------------------------------------------*/

const redactKeys = (process.env.LOG_REDACT_KEYS ?? '')
  .split(',')
  .map((key) => key.trim())
  .filter(Boolean);

const redact: LoggerOptions['redact'] =
  redactKeys.length > 0 ? { paths: redactKeys, censor: '[Redacted]' } : [];
/* -----------------------------------------------------------------------------
 * Serializer Setup
 * ---------------------------------------------------------------------------*/

/**
 * Common serializers for structured logging.
 * Ensures clean output for `req`, `res`, and `err` objects.
 */
const serializers: LoggerOptions['serializers'] = {
  err: pino.stdSerializers.err,
  req: pino.stdSerializers.req,
  res: pino.stdSerializers.res,
};

/* -----------------------------------------------------------------------------
 * Base Logger Configuration
 * ---------------------------------------------------------------------------*/

/**
 * Strictly production-oriented logger configuration.
 * Outputs newline-delimited JSON for log aggregators.
 */
const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',
  base: null, // cleaner output; omit pid/hostname
  timestamp: stdTimeFunctions.isoTime,
  redact: redact,
  formatters: {
    bindings(bindings: { pid?: number; hostname?: string }) {
      return {
        host: bindings.hostname,
        pid: bindings.pid,
        service: process.env.SERVICE_NAME ?? 'sameer-service',
      };
    },
    log(object) {
      if (object.err instanceof Error) {
        object.errorMessage = object.err.message;
        object.errorStack = object.err.stack;
        object.errorType = object.err.name;
        delete object.err;
      }
      if (object.error instanceof Error) {
        object.errorMessage = object.error.message;
        object.errorStack = object.error.stack;
        object.errorType = object.error.name;
        delete object.error;
      }
      return object;
    },
  },
  serializers,
};
/* -----------------------------------------------------------------------------
 * Logger Initialization
 * ---------------------------------------------------------------------------*/
const logFilePath = process.env.LOG_FILE_PATH;
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

//                 ┌──► stdout
// logger ──► transport
//                 └──► file.log

/**
 * Singleton logger for all services.
 * Pretty-prints only in dev, falls back silently if `pino-pretty` is missing.
 */
let transport: LoggerOptions['transport'] | undefined;

const targets: TransportTargetOptions[] = [];

if (isDev) {
  try {
    require.resolve('pino-pretty');

    // Dev: pretty console output
    targets.push({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname,levelNumber',
      },
    });
  } catch {
    // Dev fallback: JSON to stdout
    targets.push({
      target: 'pino/file',
      options: { destination: 1 },
    });
  }
} else {
  // Prod: JSON to stdout
  targets.push({
    target: 'pino/file',
    options: { destination: 1 },
  });
}

/**
 * Optional file logging
 */
if (logFilePath) {
  targets.push({
    target: 'pino/file',
    options: {
      destination: path.resolve(logFilePath),
      mkdir: true,
    },
  });
}

if (targets.length > 0) {
  transport = { targets };
}

/**
 * Singleton production logger for all services.
 * Emits structured JSON only.
 */
// export const logger: Logger = isDev
//   ? pino({
//       ...options,
//       transport: {
//         target: 'pino-pretty',
//         options: {
//           colorize: true,
//           translateTime: 'SYS:standard',
//           ignore: 'pid,hostname',
//         },
//       },
//     })
//   : pino(options);
export const logger: Logger = pino({
  ...options,
  ...(transport ? { transport } : {}),
});

/* -----------------------------------------------------------------------------
 * Scoped Context Loggers
 * ---------------------------------------------------------------------------*/

/**
 * Creates a contextual logger with static metadata.
 * Ideal for multi-service or module-specific logging.
 *
 * @example
 * ```ts
 * import { createLogger } from '@sameer/shared';
 * const dbLogger = createLogger({ module: 'database', connection: 'primary' });
 * dbLogger.debug('Connected successfully');
 * ```
 *
 * @param context - Metadata included with every log line.
 * @returns A child `Logger` with the specified context.
 */
export function createLogger(
  context: Record<string, string | number | boolean | null | undefined>
): Logger {
  return logger.child(context);
}

/* -----------------------------------------------------------------------------
 * Test-Safe Silent Mode
 * ---------------------------------------------------------------------------*/

/** Automatically disable all logs when running tests. */
if (process.env.NODE_ENV === 'test') {
  logger.level = 'silent';
}
