const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** @param averageSpeedKmh Defaults to a conservative Dhaka city-bus average. */
export function estimateEtaMinutes(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  averageSpeedKmh = 18,
): number {
  const distanceKm = haversineDistanceKm(from, to);
  return Math.round((distanceKm / averageSpeedKmh) * 60);
}
