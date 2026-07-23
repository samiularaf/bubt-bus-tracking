/**
 * Generates a tel: link server-side rather than exposing the raw number in
 * the client bundle at rest, per PROJECT_RULES.md's security baseline.
 * The number itself still reaches the client at request time (a phone has
 * to dial it somehow) — the point is it's never sitting in static JS/DOM.
 */
export function generateTelLink(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/[^\d+]/g, '');
  return `tel:${digitsOnly}`;
}
