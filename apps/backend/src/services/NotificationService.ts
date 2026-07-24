import { prisma } from '../config/prisma.js';
import { sendWebPushNotification } from '../utils/webPush.js';
import type { NotificationType } from '@prisma/client';

interface NotifyPayload {
  type: NotificationType;
  title: string;
  body: string;
  relatedTripId?: string;
  relatedNoticeId?: string;
}

export class NotificationService {
  /** Sends to every push subscription a user has (multiple devices/browsers). */
  async sendWebPush(userId: string, payload: NotifyPayload): Promise<void> {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

    for (const sub of subscriptions) {
      const result = await sendWebPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        {
          title: payload.title,
          body: payload.body,
          relatedTripId: payload.relatedTripId,
          relatedNoticeId: payload.relatedNoticeId,
        },
      );
      if (result.shouldRemoveSubscription) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }

  /** In-app bell entry — always written, regardless of push success, per the iOS fallback decision. */
  async sendInAppNotification(userId: string, payload: NotifyPayload): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        relatedTripId: payload.relatedTripId,
        relatedNoticeId: payload.relatedNoticeId,
      },
    });
  }

  /** The standard path: both channels, every time — push is best-effort, in-app is the reliable fallback. */
  async notifyUser(userId: string, payload: NotifyPayload): Promise<void> {
    await Promise.all([
      this.sendInAppNotification(userId, payload),
      this.sendWebPush(userId, payload),
    ]);
  }

  private async broadcastToAllUsers(payload: NotifyPayload): Promise<void> {
    const users = await prisma.user.findMany({ where: { role: 'user' }, select: { id: true } });
    await Promise.all(users.map((u) => this.notifyUser(u.id, payload)));
  }

  /** Sent to everyone with an active reminder on this trip, the moment the driver starts it. */
  async notifyTripStarted(tripId: string, busNumber: string): Promise<void> {
    const reminders = await prisma.reminder.findMany({
      where: { tripId, notifiedTripStart: false },
    });

    await Promise.all(
      reminders.map((reminder) =>
        this.notifyUser(reminder.userId, {
          type: 'trip_started',
          title: `${busNumber} has started`,
          body: 'The bus will depart in approximately five minutes.',
          relatedTripId: tripId,
        }),
      ),
    );

    if (reminders.length > 0) {
      await prisma.reminder.updateMany({
        where: { tripId, notifiedTripStart: false },
        data: { notifiedTripStart: true },
      });
    }
  }

  /**
   * Cron entry point (see jobs/reminderCheck.ts) — checks every reminder
   * whose trip departs within 15 minutes and hasn't been notified yet.
   */
  async checkAndSendReminders(): Promise<number> {
    const fifteenMinFromNow = new Date(Date.now() + 15 * 60_000);

    const dueReminders = await prisma.reminder.findMany({
      where: {
        notified15min: false,
        trip: { status: 'upcoming', scheduledTimeUtc: { lte: fifteenMinFromNow } },
      },
      include: { trip: { include: { bus: true } } },
    });

    for (const reminder of dueReminders) {
      await this.notifyUser(reminder.userId, {
        type: 'reminder_15min',
        title: `${reminder.trip.bus.busNumber} departs soon`,
        body: 'Your trip departs in about 15 minutes.',
        relatedTripId: reminder.tripId,
      });
      await prisma.reminder.update({ where: { id: reminder.id }, data: { notified15min: true } });
    }

    return dueReminders.length;
  }

  /** Notice published — category maps directly to notification type where one exists. */
  async notifyNoticePublished(notice: {
    id: string;
    title: string;
    body: string;
    category: string;
  }): Promise<void> {
    const categoryToType: Record<string, NotificationType> = {
      delay: 'delay',
      cancellation: 'cancellation',
      emergency: 'emergency',
    };
    const type = categoryToType[notice.category] ?? 'notice';

    await this.broadcastToAllUsers({
      type,
      title: notice.title,
      body: notice.body,
      relatedNoticeId: notice.id,
    });
  }

  /** A schedule was activated — its timings now apply system-wide. */
  async notifyScheduleChanged(scheduleName: string): Promise<void> {
    await this.broadcastToAllUsers({
      type: 'schedule_change',
      title: 'Bus schedule updated',
      body: `The "${scheduleName}" schedule is now active. Trip times may have changed.`,
    });
  }

  /** Confirmed decision: emergency alerts broadcast to Admin (via socket, see TripService) AND all users. */
  async notifyEmergency(tripId: string, busNumber: string): Promise<void> {
    await this.broadcastToAllUsers({
      type: 'emergency',
      title: `Emergency reported on ${busNumber}`,
      body: 'The driver has reported an emergency. Please check for updates.',
      relatedTripId: tripId,
    });
  }
}

export const notificationService = new NotificationService();
