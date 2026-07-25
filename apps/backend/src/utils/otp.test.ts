import { describe, it, expect } from 'vitest';
import { generateOtp, hashOtp, verifyOtp, otpExpiryDate } from './otp.js';

describe('generateOtp', () => {
  it('always generates exactly 6 digits', () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  it('pads short numbers with leading zeros (does not silently produce a 5-digit code)', () => {
    // Statistically, some of 50 generations should be < 100000 and need padding —
    // verifying the padding logic itself works rather than relying on chance,
    // by checking format invariant across many draws.
    const otps = Array.from({ length: 200 }, () => generateOtp());
    expect(otps.every((otp) => otp.length === 6)).toBe(true);
  });
});

describe('hashOtp / verifyOtp', () => {
  it('correctly verifies a matching code', async () => {
    const hash = await hashOtp('123456');
    expect(await verifyOtp('123456', hash)).toBe(true);
  });

  it('rejects a non-matching code', async () => {
    const hash = await hashOtp('123456');
    expect(await verifyOtp('654321', hash)).toBe(false);
  });

  it('never stores the code in plaintext', async () => {
    const hash = await hashOtp('999999');
    expect(hash).not.toContain('999999');
  });
});

describe('otpExpiryDate', () => {
  it('returns a date in the future', () => {
    expect(otpExpiryDate().getTime()).toBeGreaterThan(Date.now());
  });

  it('matches the configured OTP_EXPIRY_MINUTES (default 10 minutes)', () => {
    const expiry = otpExpiryDate();
    const diffMinutes = (expiry.getTime() - Date.now()) / 60_000;
    expect(diffMinutes).toBeGreaterThan(9);
    expect(diffMinutes).toBeLessThanOrEqual(10);
  });
});
