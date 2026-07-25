import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  reminder: {
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  notification: {
    create: vi.fn(),
  },
  pushSubscription: {
    findMany: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
};

vi.mock('../config/prisma.js', () => ({ prisma: mockPrisma }));
vi.mock('../utils/webPush.js', () => ({
  sendWebPushNotification: vi
    .fn()
    .mockResolvedValue({ sent: true, shouldRemoveSubscription: false }),
}));

const { notificationService } = await import('./NotificationService.js');

describe('NotificationService.checkAndSendReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.pushSubscription.findMany.mockResolvedValue([]); // no push subs by default — in-app only
  });

  it('processes zero reminders when none are due', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([]);
    const count = await notificationService.checkAndSendReminders();
    expect(count).toBe(0);
    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
  });

  it('sends an in-app notification for each due reminder and marks it notified', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([
      {
        id: 'reminder-1',
        userId: 'user-1',
        tripId: 'trip-1',
        trip: { bus: { busNumber: 'Padma' } },
      },
      {
        id: 'reminder-2',
        userId: 'user-2',
        tripId: 'trip-1',
        trip: { bus: { busNumber: 'Padma' } },
      },
    ]);

    const count = await notificationService.checkAndSendReminders();

    expect(count).toBe(2);
    expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.reminder.update).toHaveBeenCalledTimes(2);
    expect(mockPrisma.reminder.update).toHaveBeenCalledWith({
      where: { id: 'reminder-1' },
      data: { notified15min: true },
    });
  });

  it('includes the bus number in the notification content', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([
      {
        id: 'reminder-1',
        userId: 'user-1',
        tripId: 'trip-1',
        trip: { bus: { busNumber: 'Buriganga' } },
      },
    ]);

    await notificationService.checkAndSendReminders();

    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: expect.stringContaining('Buriganga') }),
      }),
    );
  });

  it('only queries reminders where notified15min is false (idempotency)', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([]);
    await notificationService.checkAndSendReminders();

    expect(mockPrisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ notified15min: false }),
      }),
    );
  });
});

describe('NotificationService.notifyTripStarted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.pushSubscription.findMany.mockResolvedValue([]);
  });

  it('does nothing when no one has a reminder on this trip', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([]);
    await notificationService.notifyTripStarted('trip-1', 'Padma');
    expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    expect(mockPrisma.reminder.updateMany).not.toHaveBeenCalled();
  });

  it('notifies every reminder holder and marks notifiedTripStart', async () => {
    mockPrisma.reminder.findMany.mockResolvedValue([
      { userId: 'user-1', tripId: 'trip-1' },
      { userId: 'user-2', tripId: 'trip-1' },
    ]);

    await notificationService.notifyTripStarted('trip-1', 'Padma');

    expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.reminder.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { notifiedTripStart: true } }),
    );
  });
});
