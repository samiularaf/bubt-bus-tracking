// Shared ESLint flat config for the whole monorepo.
// Per-app configs (apps/frontend, apps/backend) extend this with app-specific plugins
// (React hooks, etc.) rather than duplicating these base rules.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/.vite/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Seed/CLI scripts and background jobs legitimately log progress/status to stdout.
    files: ['**/prisma/seed.ts', '**/scripts/**', '**/jobs/**', '**/backend/src/index.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Service worker runs in its own global scope, not Node or browser-window.
    files: ['**/service-worker.js'],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
);
