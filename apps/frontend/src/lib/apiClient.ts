import type { ApiResponse } from '@bubt/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/**
 * Single fetch wrapper all feature api.ts files call through — per
 * ARCHITECTURE.md §2 ("no raw fetch scattered in components"). Refresh-on-401
 * retry logic is wired up alongside the real auth flow in Phase 8.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  return (await res.json()) as ApiResponse<T>;
}
