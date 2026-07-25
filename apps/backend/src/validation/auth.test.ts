import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, verifyOtpSchema } from './auth.js';

describe('registerSchema', () => {
  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse({
      name: 'Rafi Ahmed',
      email: 'rafi@bubt.edu.bd',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password under 8 characters (per PROJECT_SPECIFICATION.md §4)', () => {
    const result = registerSchema.safeParse({
      name: 'Rafi Ahmed',
      email: 'rafi@bubt.edu.bd',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Rafi Ahmed',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('lowercases and trims the email', () => {
    const result = registerSchema.safeParse({
      name: 'Rafi Ahmed',
      email: '  Rafi@BUBT.edu.bd  ',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('rafi@bubt.edu.bd');
    }
  });

  it('rejects an invalid designation value', () => {
    const result = registerSchema.safeParse({
      name: 'Rafi Ahmed',
      email: 'rafi@bubt.edu.bd',
      password: 'password123',
      designation: 'astronaut',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid identifier + password', () => {
    expect(loginSchema.safeParse({ identifier: 'rafi@bubt.edu.bd', password: 'x' }).success).toBe(
      true,
    );
  });

  it('accepts a Driver ID as the identifier (unified login, per API_DESIGN.md §2)', () => {
    expect(loginSchema.safeParse({ identifier: 'DRV-001', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty identifier', () => {
    expect(loginSchema.safeParse({ identifier: '', password: 'x' }).success).toBe(false);
  });
});

describe('verifyOtpSchema', () => {
  it('accepts a valid 6-digit numeric code', () => {
    const result = verifyOtpSchema.safeParse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      code: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a code that is not 6 digits', () => {
    const result = verifyOtpSchema.safeParse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      code: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-numeric code', () => {
    const result = verifyOtpSchema.safeParse({
      userId: '123e4567-e89b-12d3-a456-426614174000',
      code: 'abcdef',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed userId (not a UUID)', () => {
    const result = verifyOtpSchema.safeParse({ userId: 'not-a-uuid', code: '123456' });
    expect(result.success).toBe(false);
  });
});
