import cron from 'node-cron';
import { notificationService } from '../services/NotificationService.js';

/**
 * Checks every minute for reminders due within the next 15 minutes and sends
 * them, per the confirmed reminder system (ACTOR_AUTH_AND_CREDENTIALS.pdf /
 * PROJECT_SPECIFICATION.md §5). Started once from index.ts.
 */
export function startReminderCheckJob(): void {
  cron.schedule('* * * * *', async () => {
    try {
      const count = await notificationService.checkAndSendReminders();
      if (count > 0) {
        console.log(`[jobs] sent ${count} trip reminder(s)`);
      }
    } catch (err) {
      console.error('[jobs] reminder check failed:', err);
    }
  });
}
