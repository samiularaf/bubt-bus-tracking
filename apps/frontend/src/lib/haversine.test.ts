import { describe, it, expect } from 'vitest';
import { haversineDistanceKm, estimateEtaMinutes } from './haversine';

describe('haversineDistanceKm', () => {
  it('returns 0 for identical points', () => {
    const point = { lat: 23.8103, lng: 90.4125 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('is symmetric', () => {
    const a = { lat: 23.75, lng: 90.35 };
    const b = { lat: 23.82, lng: 90.41 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 10);
  });
});

describe('estimateEtaMinutes', () => {
  it('returns 0 for the same point', () => {
    const point = { lat: 23.8103, lng: 90.4125 };
    expect(estimateEtaMinutes(point, point)).toBe(0);
  });

  it('increases as distance increases', () => {
    const from = { lat: 23.75, lng: 90.35 };
    const near = { lat: 23.751, lng: 90.351 };
    const far = { lat: 23.85, lng: 90.45 };
    expect(estimateEtaMinutes(from, far)).toBeGreaterThan(estimateEtaMinutes(from, near));
  });
});
