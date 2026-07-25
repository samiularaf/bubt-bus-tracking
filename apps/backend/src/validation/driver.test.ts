import { describe, it, expect } from 'vitest';
import { createDriverSchema } from './driver.js';

const VALID_DRIVER = {
  name: 'Md. Rafiqul Islam',
  phone: '01700000000',
  bloodGroup: 'O+',
  nidOrLicense: 'NID-1234',
  address: 'Dhaka, Bangladesh',
  emergencyContact: '01800000000',
  assignedBusId: '123e4567-e89b-12d3-a456-426614174000',
};

describe('createDriverSchema', () => {
  it('accepts a fully valid driver profile', () => {
    expect(createDriverSchema.safeParse(VALID_DRIVER).success).toBe(true);
  });

  // Per DATABASE_DESIGN.md §4's CHECK constraint and ACTOR_AUTH_AND_CREDENTIALS.pdf's
  // confirmed required field set — these must all be required, not optional.
  const requiredFields = [
    'name',
    'phone',
    'bloodGroup',
    'nidOrLicense',
    'address',
    'emergencyContact',
    'assignedBusId',
  ] as const;

  for (const field of requiredFields) {
    it(`rejects a driver profile missing '${field}'`, () => {
      const { [field]: _omitted, ...incomplete } = VALID_DRIVER;
      expect(createDriverSchema.safeParse(incomplete).success).toBe(false);
    });
  }

  it('accepts email and photoUrl as optional', () => {
    const result = createDriverSchema.safeParse(VALID_DRIVER);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid assignedBusId (not a UUID)', () => {
    const result = createDriverSchema.safeParse({ ...VALID_DRIVER, assignedBusId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
