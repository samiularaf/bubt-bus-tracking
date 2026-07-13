import { PrismaClient } from '@prisma/client';

// Singleton pattern avoids exhausting DB connections via hot-reload in dev.
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
