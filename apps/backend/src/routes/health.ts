import { Router } from 'express';
import { prisma } from '../config/prisma.js';

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Confirms the API is up and can reach the database. Not listed in API_DESIGN.md
 * as a product endpoint — this is infrastructure-only, used by Railway's health
 * checks and local dev sanity checks.
 */
healthRouter.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'unreachable' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'unreachable';
  }

  const statusCode = dbStatus === 'ok' ? 200 : 503;
  res.status(statusCode).json({
    success: dbStatus === 'ok',
    data: {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    error: dbStatus === 'ok' ? null : { code: 'INTERNAL_ERROR', message: 'Database unreachable.' },
  });
});
