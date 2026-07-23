import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

const OTP_SALT_ROUNDS = 8; // lighter than password hashing — OTPs are short-lived and low-entropy by design

/** Generates a 6-digit numeric OTP, per ACTOR_AUTH_AND_CREDENTIALS.pdf. */
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, OTP_SALT_ROUNDS);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + env.otpExpiryMinutes * 60_000);
}
