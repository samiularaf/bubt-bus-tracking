import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveDayGroup } from './ScheduleService.js';

// Helper: construct a date for a known weekday without timezone ambiguity.
// 2026-01-04 is a Sunday. Uses the local-time constructor (not Date.UTC)
// because Date.prototype.getDay() reads local time, and resolveDayGroup
// relies on getDay() — mixing UTC construction with local-time reads would
// make this test flaky depending on the CI runner's timezone.
function dateForWeekday(daysAfterSunday: number): Date {
  return new Date(2026, 0, 4 + daysAfterSunday);
}

describe('resolveDayGroup', () => {
  it('resolves Sunday through Thursday to sun_thu', () => {
    for (let day = 0; day <= 4; day++) {
      expect(resolveDayGroup(dateForWeekday(day))).toBe('sun_thu');
    }
  });

  it('resolves Friday to friday', () => {
    expect(resolveDayGroup(dateForWeekday(5))).toBe('friday');
  });

  it('resolves Saturday to null — no bus service at all, per the real BUBT notice', () => {
    expect(resolveDayGroup(dateForWeekday(6))).toBeNull();
  });
});

const mockPrisma = vi.hoisted(() => ({
  schedule: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  scheduleTripTemplate: {
    findMany: vi.fn(),
  },
  trip: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
}));

vi.mock('../config/prisma.js', () => ({ prisma: mockPrisma }));
vi.mock('./NotificationService.js', () => ({
  notificationService: { notifyScheduleChanged: vi.fn().mockResolvedValue(undefined) },
}));

const { scheduleService } = await import('./ScheduleService.js');

describe('ScheduleService.activateSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));
    mockPrisma.scheduleTripTemplate.findMany.mockResolvedValue([]);
    mockPrisma.schedule.findFirst.mockResolvedValue(null);
  });

  it('throws NOT_FOUND for a non-existent schedule', async () => {
    mockPrisma.schedule.findUnique.mockResolvedValue(null);
    await expect(scheduleService.activateSchedule('missing')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws SCHEDULE_ALREADY_ACTIVE if the schedule is already the active one', async () => {
    mockPrisma.schedule.findUnique.mockResolvedValue({
      id: 'sched-1',
      isActive: true,
      name: 'Regular',
    });
    await expect(scheduleService.activateSchedule('sched-1')).rejects.toMatchObject({
      code: 'SCHEDULE_ALREADY_ACTIVE',
    });
  });

  it('deactivates all other schedules before activating the requested one (single-active invariant)', async () => {
    mockPrisma.schedule.findUnique.mockResolvedValue({
      id: 'sched-2',
      isActive: false,
      name: 'Ramadan',
    });

    await scheduleService.activateSchedule('sched-2');

    // The transaction must contain both: deactivate-all-active, then activate this one.
    expect(mockPrisma.schedule.updateMany).toHaveBeenCalledWith({
      where: { isActive: true },
      data: { isActive: false },
    });
    expect(mockPrisma.schedule.update).toHaveBeenCalledWith({
      where: { id: 'sched-2' },
      data: { isActive: true },
    });
  });
});
