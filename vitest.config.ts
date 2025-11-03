// vitest.config.ts
// -----------------------------------------------------------------------------
// Vitest configuration for Sameer Shared SDK
//
// • Fully native ESM + TypeScript support (no build step needed)
// • Includes coverage reports using the v8 provider
// • Runs in Node environment (SDKs, APIs, crypto, filesystem)
// -----------------------------------------------------------------------------

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use global describe/it/expect like Jest
    environment: 'node', // Node.js environment (not browser)
    include: ['src/tests/**/*.test.ts'], // Match your existing test folder
    coverage: {
      provider: 'v8', // Fast native coverage via V8 engine
      reporter: ['text', 'html'], // Console + HTML report
      reportsDirectory: './coverage',
    },
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
    logHeapUsage: false,
    slowTestThreshold: 2000,
  },
});
