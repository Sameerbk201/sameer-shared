import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';
export default defineConfig([
  // --------------------------------------------------
  // Ignore build & config artifacts
  // --------------------------------------------------
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.cjs', '*.config.js', 'src/tests/**/*.cjs'],
  },

  // --------------------------------------------------
  // Base config for JS + TS
  // --------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: process.cwd(),
      },
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      'prettier': eslintPluginPrettier,
      '@typescript-eslint': tseslint.plugin,
      'import': pluginImport,
    },

    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettier, // MUST be last
    ],

    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      // --------------------------------------------------
      // Prettier
      // --------------------------------------------------
      'prettier/prettier': ['warn', { endOfLine: 'lf', singleQuote: true }],

      // --------------------------------------------------
      // Imports
      // --------------------------------------------------
      'import/extensions': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'warn',
      'import/order': [
        'warn',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          'alphabetize': { order: 'asc', caseInsensitive: true },
        },
      ],

      // --------------------------------------------------
      // Style & consistency
      // --------------------------------------------------
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'only-multiline'],
      'object-curly-spacing': ['warn', 'always'],
      'eqeqeq': ['warn', 'always'],
      'prefer-const': 'warn',
      'no-var': 'warn',

      // --------------------------------------------------
      // TypeScript safety
      // --------------------------------------------------
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // --------------------------------------------------
      // Shadowing (TS-aware)
      // --------------------------------------------------
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',

      // --------------------------------------------------
      // Node / Express
      // --------------------------------------------------
      'no-console': 'off',
      'handle-callback-err': ['warn', '^err'],
      'no-path-concat': 'warn',

      // --------------------------------------------------
      // General safety
      // --------------------------------------------------
      'no-empty-function': 'warn',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      // --------------------------------------------------
      // Async & Promise correctness
      // --------------------------------------------------
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  // --------------------------------------------------
  // JS-only override: require extensions
  // --------------------------------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'import/extensions': [
        'warn',
        'ignorePackages',
        {
          js: 'always',
          mjs: 'always',
          cjs: 'always',
        },
      ],
    },
  },

  // --------------------------------------------------
  // Test files (Vitest)
  // --------------------------------------------------
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx', 'src/tests/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.vitest,
      },
    },
    extends: ['plugin:vitest/recommended'],

    rules: {
      // Tests are allowed to be more flexible
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Async helpers often return void in tests
      '@typescript-eslint/no-floating-promises': 'off',

      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
    },
  },
]);
