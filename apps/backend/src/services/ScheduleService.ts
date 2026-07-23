import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
  CreateScheduleTemplateInput,
  UpdateScheduleTemplateInput,
} from '../validation/trip.js';
import type { DayGroup } from '@prisma/client';

/** Sunday=0 ... Saturday=6. Saturday has no bus service at all, per the real BUBT notice. */
function resolveDayGroup(date: Date): DayGroup | null {
  const day = date.getDay();
  if (day === 6) return null; // Saturday — no service
  if (day === 5) return 'friday';
  return 'sun_thu';
}

export class ScheduleService {
  async listSchedules() {
    return prisma.schedule.findMany({ include: { templates: true } });
  }

  async createSchedule(input: CreateScheduleInput) {
    return prisma.schedule.create({ data: { ...input, isActive: false } });
  }

  async updateSchedule(scheduleId: string, input: UpdateScheduleInput) {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new AppError('NOT_FOUND', 'Schedule not found.', 404);
    return prisma.schedule.update({ where: { id: scheduleId }, data: input });
  }

  /** Activates one schedule, deactivates all others, and regenerates today's + tomorrow's trips. */
  async activateSchedule(scheduleId: string): Promise<void> {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new AppError('NOT_FOUND', 'Schedule not found.', 404);
    if (schedule.isActive) {
      throw new AppError('SCHEDULE_ALREADY_ACTIVE', 'This schedule is already active.', 409);
    }

    await prisma.$transaction([
      prisma.schedule.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.schedule.update({ where: { id: scheduleId }, data: { isActive: true } }),
    ]);

    await this.generateTripsForDate(new Date());
    await this.generateTripsForDate(new Date(Date.now() + 86_400_000));
  }

  async listTemplates(scheduleId: string) {
    return prisma.scheduleTripTemplate.findMany({ where: { scheduleId }, include: { bus: true } });
  }

  async createTemplate(scheduleId: string, input: CreateScheduleTemplateInput) {
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new AppError('NOT_FOUND', 'Schedule not found.', 404);

    return prisma.scheduleTripTemplate.create({
      data: {
        scheduleId,
        busId: input.busId,
        dayGroup: input.dayGroup,
        departureTime: new Date(`1970-01-01T${input.departureTime}Z`),
      },
    });
  }

  async updateTemplate(templateId: string, input: UpdateScheduleTemplateInput) {
    const template = await prisma.scheduleTripTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new AppError('NOT_FOUND', 'Template not found.', 404);

    return prisma.scheduleTripTemplate.update({
      where: { id: templateId },
      data: {
        busId: input.busId,
        dayGroup: input.dayGroup,
        departureTime: input.departureTime
          ? new Date(`1970-01-01T${input.departureTime}Z`)
          : undefined,
      },
    });
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const template = await prisma.scheduleTripTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new AppError('NOT_FOUND', 'Template not found.', 404);
    await prisma.scheduleTripTemplate.delete({ where: { id: templateId } });
  }

  /**
   * Generates trips for a given date from the currently active schedule's
   * templates. Idempotent — won't duplicate trips already generated for that
   * bus/time. Saturday resolves to no day-group and generates nothing.
   */
  async generateTripsForDate(date: Date): Promise<number> {
    const dayGroup = resolveDayGroup(date);
    if (!dayGroup) return 0; // Saturday — no service

    const activeSchedule = await prisma.schedule.findFirst({ where: { isActive: true } });
    if (!activeSchedule) return 0;

    const templates = await prisma.scheduleTripTemplate.findMany({
      where: { scheduleId: activeSchedule.id, dayGroup },
      include: { bus: { include: { driver: true } } },
    });

    const tripDate = new Date(date);
    tripDate.setHours(0, 0, 0, 0);

    let createdCount = 0;
    for (const template of templates) {
      const scheduledTimeUtc = new Date(tripDate);
      scheduledTimeUtc.setUTCHours(
        template.departureTime.getUTCHours(),
        template.departureTime.getUTCMinutes(),
        0,
        0,
      );

      const existing = await prisma.trip.findUnique({
        where: { busId_scheduledTimeUtc: { busId: template.busId, scheduledTimeUtc } },
      });
      if (existing) continue;

      await prisma.trip.create({
        data: {
          busId: template.busId,
          scheduleTripTemplateId: template.id,
          driverId: template.bus.driver?.id,
          tripDate,
          scheduledTimeUtc,
          status: 'upcoming',
        },
      });
      createdCount++;
    }

    return createdCount;
  }
}

export const scheduleService = new ScheduleService();
