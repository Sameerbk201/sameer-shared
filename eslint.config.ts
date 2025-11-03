import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  { ignores: ['dist/**', 'node_modules/**', '*.config.cjs', '*.config.js', 'src/tests/**/*.cjs'] },
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
        ...globals.browser,
      },
    },
    plugins: {
      'prettier': eslintPluginPrettier,
      '@typescript-eslint': tseslint.plugin,
      'import': pluginImport,
    },
    extends: [
      js.configs.recommended, // ESLint recommended
      ...tseslint.configs.recommended, // TypeScript recommended
      prettier, // Prettier last
    ],
    // Teach eslint-plugin-import how to resolve TS path aliases
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },

    rules: {
      // Require extensions for real JS files, but NOT for TS or packages/aliases
      // 'import/extensions': [
      //   'warn',
      //   'ignorePackages',
      //   {
      //     js: 'always',
      //     mjs: 'always',
      //     cjs: 'always',
      //     ts: 'never',
      //     tsx: 'never',
      //     mts: 'never',
      //     cts: 'never',
      //   },
      // keep this only for JS via an override below
      'import/extensions': 'off',
      // ],
      // Avoid false positives with TS paths
      'import/no-unresolved': 'off',
      // Let the TS resolver handle this instead of guessing
      // 'import/no-unresolved': 'off',
      // If you also use eslint-plugin-n, turn this off so it doesn't fight:
      // 'n/file-extension-in-import': 'off',

      // Prettier integration
      'prettier/prettier': ['warn', { endOfLine: 'lf', singleQuote: true }],

      // Style preferences
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'only-multiline'],
      'object-curly-spacing': ['warn', 'always'],

      // Best practices
      'eqeqeq': ['warn', 'always'],
      'no-console': 'off', // allow console logs for backend
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'prefer-const': 'warn',
      'no-var': 'warn',

      // Node.js specifics
      'callback-return': 'warn',
      'handle-callback-err': ['warn', '^err'],
      'no-path-concat': 'warn',

      // Optional strictness
      'no-empty-function': 'warn',
      'no-shadow': 'warn',
    },
  },
  // JS-only: require extensions for relative JS imports
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'import/extensions': [
        'warn',
        'ignorePackages',
        { js: 'always', mjs: 'always', cjs: 'always' },
      ],
    },
  },
]);
