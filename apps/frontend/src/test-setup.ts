import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Required because vitest.config.ts sets test.globals: false — React Testing
// Library's automatic cleanup relies on a global afterEach being available,
// which doesn't happen without this explicit wiring. Without it, every
// render() call leaves its DOM in place for the next test, causing elements
// to accumulate across tests within the same file (confirmed: a test
// expecting 4 OTP boxes found 10 — the prior test's 6 boxes plus its own 4).
afterEach(() => {
  cleanup();
});
