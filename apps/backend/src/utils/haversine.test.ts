import { describe, it, expect } from 'vitest';
import { haversineDistanceKm, estimateEtaMinutes } from './haversine.js';

describe('haversineDistanceKm', () => {
  it('returns 0 for identical points', () => {
    const point = { lat: 23.8103, lng: 90.4125 };
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 5);
  });

  it('computes a known distance correctly (Dhaka to Chittagong, ~245km great-circle)', () => {
    const dhaka = { lat: 23.8103, lng: 90.4125 };
    const chittagong = { lat: 22.3569, lng: 91.7832 };
    const distance = haversineDistanceKm(dhaka, chittagong);
    // Great-circle distance, not road distance — expect ~244-246km.
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(260);
  });

  it('is symmetric (A to B equals B to A)', () => {
    const a = { lat: 23.75, lng: 90.35 };
    const b = { lat: 23.82, lng: 90.41 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 10);
  });
});

describe('estimateEtaMinutes', () => {
  it('returns 0 minutes for the same point', () => {
    const point = { lat: 23.8103, lng: 90.4125 };
    expect(estimateEtaMinutes(point, point)).toBe(0);
  });

  it('scales inversely with average speed', () => {
    const from = { lat: 23.75, lng: 90.35 };
    const to = { lat: 23.82, lng: 90.42 };
    const etaSlow = estimateEtaMinutes(from, to, 10);
    const etaFast = estimateEtaMinutes(from, to, 40);
    expect(etaSlow).toBeGreaterThan(etaFast);
  });

  it('uses the confirmed default Dhaka city-bus average (18 km/h) when unspecified', () => {
    const from = { lat: 23.75, lng: 90.35 };
    const to = { lat: 23.82, lng: 90.42 };
    const defaultEta = estimateEtaMinutes(from, to);
    const explicitEta = estimateEtaMinutes(from, to, 18);
    expect(defaultEta).toBe(explicitEta);
  });
});
