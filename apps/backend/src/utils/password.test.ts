import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateTemporaryPassword } from './password.js';

describe('hashPassword / verifyPassword', () => {
  it('correctly verifies a matching password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('correct-horse-battery-staple', hash)).toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('never stores the password in plaintext', async () => {
    const hash = await hashPassword('my-secret-password');
    expect(hash).not.toContain('my-secret-password');
  });

  it('produces a different hash each time (salted)', async () => {
    const hash1 = await hashPassword('same-password');
    const hash2 = await hashPassword('same-password');
    expect(hash1).not.toBe(hash2);
  });
});

describe('generateTemporaryPassword', () => {
  it('generates a password of reasonable length', () => {
    const password = generateTemporaryPassword();
    expect(password.length).toBeGreaterThanOrEqual(10);
  });

  it('generates different passwords on each call', () => {
    const passwords = new Set(Array.from({ length: 20 }, () => generateTemporaryPassword()));
    expect(passwords.size).toBe(20);
  });

  it('always ends with the required special character', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateTemporaryPassword().endsWith('!')).toBe(true);
    }
  });
});
