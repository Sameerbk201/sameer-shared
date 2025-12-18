import fs from 'node:fs';
import path from 'node:path';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const TMP_DIR = path.join(process.cwd(), 'tmp-test-logs');
const LOG_FILE = path.join(TMP_DIR, 'app.log');
console.log({ TMP_DIR, LOG_FILE });
function cleanEnv() {
  delete process.env.LOG_FILE_PATH;
  process.env.NODE_ENV = 'test';
}

async function importFreshLogger() {
  // Important: reset module cache so env vars are re-read
  vi.resetModules();
  return await import('../../logger/logger.js');
}

describe('logger smoke tests', () => {
  beforeEach(() => {
    cleanEnv();
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('works without LOG_FILE_PATH (console only)', async () => {
    const { logger } = await importFreshLogger();

    expect(() => {
      logger.info('console only log');
      logger.error(new Error('test error'));
    }).not.toThrow();
  });

  it('writes logs to file when LOG_FILE_PATH is provided', async () => {
    process.env.LOG_FILE_PATH = LOG_FILE;

    const { logger } = await importFreshLogger();

    // 🔑 override silent mode for this test only
    logger.level = 'info';

    logger.info('file log test');
    logger.error(new Error('file error'));

    await new Promise((r) => setTimeout(r, 100));

    expect(fs.existsSync(LOG_FILE)).toBe(true);

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    expect(content).toContain('file log test');
  });
});
