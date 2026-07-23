import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  UpdateProfileInput,
  PushSubscriptionInput,
  PaginationQuery,
} from '../validation/misc.js';

export class UserService {
  async getProfile(userId: string) {
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return prisma.user.update({ where: { id: userId }, data: input });
  }

  async listFavorites(userId: string) {
    return prisma.favoriteBus.findMany({ where: { userId }, include: { bus: true } });
  }

  async addFavorite(userId: string, busId: string) {
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new AppError('NOT_FOUND', 'Bus not found.', 404);

    const existing = await prisma.favoriteBus.findUnique({
      where: { userId_busId: { userId, busId } },
    });
    if (existing) throw new AppError('CONFLICT', 'This bus is already a favorite.', 409);

    return prisma.favoriteBus.create({ data: { userId, busId } });
  }

  async removeFavorite(userId: string, busId: string): Promise<void> {
    await prisma.favoriteBus.deleteMany({ where: { userId, busId } });
  }

  async listReminders(userId: string) {
    return prisma.reminder.findMany({ where: { userId }, include: { trip: true } });
  }

  async listNotifications(userId: string, pagination: PaginationQuery) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, page: pagination.page, limit: pagination.limit, total };
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new AppError('NOT_FOUND', 'Notification not found.', 404);
    }
    await prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  }

  async addPushSubscription(userId: string, input: PushSubscriptionInput) {
    return prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: input.endpoint } },
      update: { p256dh: input.keys.p256dh, auth: input.keys.auth },
      create: {
        userId,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
    });
  }

  async removePushSubscription(userId: string, endpoint: string): Promise<void> {
    await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  }
}

export const userService = new UserService();
