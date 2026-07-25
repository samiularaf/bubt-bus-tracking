import { describe, it, expect, beforeAll } from 'vitest';

// env vars must be set before importing anything that reads env.ts at module load time.
beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

describe('JWT utilities', () => {
  it('signs and verifies an access token round-trip', async () => {
    const { signAccessToken, verifyAccessToken } = await import('./jwt.js');
    const token = signAccessToken({ sub: 'user-1', role: 'user', mustChangePassword: false });
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('user');
    expect(payload.mustChangePassword).toBe(false);
  });

  it('signs and verifies a refresh token round-trip', async () => {
    const { signRefreshToken, verifyRefreshToken } = await import('./jwt.js');
    const token = signRefreshToken({ sub: 'user-1', tokenId: 'token-abc' });
    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.tokenId).toBe('token-abc');
  });

  it('rejects a token signed with a different secret', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const { verifyAccessToken } = await import('./jwt.js');
    const forgedToken = jwt.sign({ sub: 'attacker', role: 'admin' }, 'wrong-secret');

    expect(() => verifyAccessToken(forgedToken)).toThrow();
  });

  it('rejects a malformed token', async () => {
    const { verifyAccessToken } = await import('./jwt.js');
    expect(() => verifyAccessToken('not-a-real-jwt')).toThrow();
  });

  it('access and refresh tokens use different secrets (one cannot verify the other)', async () => {
    const { signAccessToken, verifyRefreshToken } = await import('./jwt.js');
    const accessToken = signAccessToken({ sub: 'user-1', role: 'user', mustChangePassword: false });
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});
