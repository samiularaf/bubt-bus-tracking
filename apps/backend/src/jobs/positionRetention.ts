import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

/**
 * Purges raw GPS history older than the configured retention window, per the
 * confirmed data rule in PROJECT_RULES.md / DATABASE_DESIGN.md §5. Runs once
 * daily at 3 AM server time — cheap, infrequent, no need for per-minute cron.
 */
export function startPositionRetentionJob(): void {
  cron.schedule('0 3 * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - env.tripPositionRetentionDays * 24 * 3600_000);
      const result = await prisma.tripPosition.deleteMany({
        where: { recordedAt: { lt: cutoff } },
      });
      console.log(
        `[jobs] purged ${result.count} trip_positions row(s) older than ${env.tripPositionRetentionDays}d`,
      );
    } catch (err) {
      console.error('[jobs] position retention cleanup failed:', err);
    }
  });
}
