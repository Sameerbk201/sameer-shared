# Shared SDK

## Overview

The **Shared SDK** is a foundational utility library providing shared, reusable services for personal and open-source Node.js projects.

It includes two primary modules:

- **Logger** — A structured, high-performance logging layer built on [`pino`](https://getpino.io/).
- **Encryption Service** — A secure, TypeScript-typed AES-256-CBC encryption and SHA-256 hashing utility.

This SDK is designed to be:

- **Lightweight** — minimal dependencies, no frameworks
- **Isolated** — stateless and environment-agnostic
- **Type-safe** — written in modern TypeScript
- **ESM-compatible** — built for Node.js 18+ and ECMAScript Modules (ESM)

---

## Table of Contents

- [Shared SDK](#shared-sdk)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
    - [Validation Schema](#validation-schema)
  - [Core Components](#core-components)
    - [Logger](#logger)
      - [Logger Overview](#logger-overview)
      - [Key Features](#key-features)
      - [Usage Example](#usage-example)
        - [Optional pretty-printing for development](#optional-pretty-printing-for-development)
    - [Encryption Service](#encryption-service)
      - [Encryption Overview](#encryption-overview)
      - [Usage Example 1](#usage-example-1)
      - [Behavior](#behavior)
  - [Usage Scenarios](#usage-scenarios)
    - [Combine Logger + Encryption](#combine-logger--encryption)
  - [Development Workflow](#development-workflow)
    - [Prerequisites](#prerequisites)
    - [Commands](#commands)
  - [Testing](#testing)
    - [Example Commands](#example-commands)
  - [Linting and Formatting](#linting-and-formatting)
  - [Build and Distribution](#build-and-distribution)
  - [Versioning and Compatibility](#versioning-and-compatibility)
  - [License](#license)

---

## Architecture

The SDK follows a modular, layered design so you can import only what you need.

```bash
sameer-shared/
├── src/
│   ├── logger/                # Pino-based structured logger
│   │   └── logger.ts
│   ├── services/              # Shared services (encryption, utilities)
│   │   ├── encryption.service.ts
│   │   └── index.ts
│   ├── index.ts               # Exports logger + services
│   └── tests/                 # Vitest-based unit tests
│       ├── unit/
│       │   ├── encryption.service.test.ts
│       │   └── sample.test.ts
├── vitest.config.ts
├── package.json
└── README.md
```

---

## Installation

Install from npm or your private registry:

```bash
npm install @sameer/shared
# or
pnpm add @sameer/shared
```

---

## Environment Configuration

The **Encryption Service** requires valid environment variables for AES keys.
Validation occurs automatically at import time using [`zod`](https://zod.dev).

Add the following keys to your `.env` file:

```env
AES_SECRET_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
AES_IV=abcdef9876543210abcdef9876543210

# Optional
ENVIRONMENT=development
```

### Validation Schema

The SDK enforces:

| Variable         | Description                           | Example                            | Validation                                         |
| ---------------- | ------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| `AES_SECRET_KEY` | 64-character hex string (256-bit key) | `0123…abcd`                        | Must be valid hex                                  |
| `AES_IV`         | 32-character hex string (128-bit IV)  | `abcdef9876543210abcdef9876543210` | Must be valid hex                                  |
| `ENVIRONMENT`    | Runtime environment flag              | `development`                      | Must be one of `development`, `test`, `production` |

If any are missing or invalid, the SDK throws a descriptive error on load.

---

## Core Components

### Logger

#### Logger Overview

The shared **Logger** provides consistent, structured logging across all projects.
It’s built on top of [`pino`](https://getpino.io/), a fast JSON logger for Node.js.

#### Key Features

- Zero-config, production-ready logger
- JSON structured output (machine-parsable)
- Pretty-printing in development with `pino-pretty`
- Supports contextual metadata (e.g., service name, environment)

#### Usage Example

```ts
import { logger } from '@sameer/shared';

logger.info('Application started');
logger.warn({ module: 'auth' }, 'Missing credentials');
logger.error({ err: new Error('Bad Request') }, 'Failed request');

// Add custom context
logger.child({ module: 'api' }).info('Request received');
```

##### Optional pretty-printing for development

```bash
npm install -D pino-pretty
node -r pino-pretty app.js
```

---

### Encryption Service

#### Encryption Overview

Provides AES-256-CBC encryption and SHA-256 hashing for secure, deterministic handling of sensitive data.

#### Usage Example 1

```ts
import { encryptionService } from '@sameer/shared';

const email = 'alice@example.com';

// Encrypt (reversible)
const ciphertext = encryptionService.encrypt(email);

// Decrypt back to plaintext
const plaintext = encryptionService.decrypt(ciphertext);

// Hash (irreversible)
const hash = encryptionService.hash(email);

console.log({ ciphertext, plaintext, hash });
```

#### Behavior

| Operation   | Type       | Output      | Description                             |
| ----------- | ---------- | ----------- | --------------------------------------- |
| `encrypt()` | Reversible | Hex string  | Encrypts text using AES-256-CBC         |
| `decrypt()` | Reversible | Plaintext   | Decrypts hex ciphertext back to UTF-8   |
| `hash()`    | One-way    | 64-char hex | SHA-256 hash, ideal for indexing/search |

---

## Usage Scenarios

### Combine Logger + Encryption

```ts
import { logger, encryptionService } from '@sameer/shared';

try {
  const encrypted = encryptionService.encrypt('secret@example.com');
  const hash = encryptionService.hash('secret@example.com');

  logger.info({ encrypted, hash }, 'Data processed securely');
} catch (err) {
  logger.error({ err }, 'Encryption operation failed');
}
```

---

## Development Workflow

### Prerequisites

- Node.js ≥ 18.x (ESM native)
- npm or pnpm
- Optional: VS Code for TypeScript + ESLint integration

### Commands

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run build`         | Compile TypeScript into `dist/`         |
| `npm run dev`           | Watch and recompile on file changes     |
| `npm run lint`          | Run ESLint on all `.ts` and `.js` files |
| `npm run lint:fix`      | Auto-fix lint issues                    |
| `npm run format`        | Format all files using Prettier         |
| `npm run clean`         | Remove compiled build artifacts         |
| `npm run test`          | Run all unit tests with Vitest          |
| `npm run test:watch`    | Run tests in watch mode                 |
| `npm run test:coverage` | Generate HTML and text coverage reports |

---

## Testing

The SDK uses [**Vitest**](https://vitest.dev/) — a fast, Jest-compatible test runner with TypeScript support.

### Example Commands

```bash
# Run all tests
npm run test

# Run a specific test file
npm run test -- src/tests/unit/sample.test.ts

# Run with coverage
npm run test:coverage
```

Tests live under `src/tests/unit/` and follow the naming convention:
`*.test.ts` for unit tests.

Example: [`sample.test.ts`](src/tests/unit/sample.test.ts) demonstrates patterns for writing maintainable tests.

---

## Linting and Formatting

The SDK enforces consistent code quality standards:

- **ESLint (flat config)** — using `@typescript-eslint` and `eslint-plugin-prettier`
- **Prettier 3** — opinionated formatting for all file types
- **Auto-fix on save** (recommended in VS Code)

> All imports must use relative `.js` extensions for ESM compliance.

---

## Build and Distribution

Builds are generated in the `dist/` directory using TypeScript’s `tsc`.

**Output structure:**

```bash
dist/
├── index.js
├── logger/
│   └── logger.js
└── services/
    └── encryption.service.js
```

**Exports (package.json):**

```json
"exports": {
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
}
```

The SDK is fully **ESM-ready** and supports native TypeScript types.

---

## Versioning and Compatibility

- Follows **Semantic Versioning (SemVer)** — `MAJOR.MINOR.PATCH`
- Compatible with **Node.js 18+**
- Changes remain backward-compatible unless a major version bump is released

---

## License

**MIT License** © Sameer

You’re free to use, modify, and distribute this library in open-source or private projects.

---
