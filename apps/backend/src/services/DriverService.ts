import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UpdateDriverInput } from '../validation/driver.js';
import type { PaginationQuery } from '../validation/misc.js';
import type { AccountStatus } from '@prisma/client';

export class DriverService {
  async list(pagination: PaginationQuery, status?: AccountStatus) {
    const where = { role: 'driver' as const, ...(status ? { status } : {}) };
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        include: { assignedBus: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, page: pagination.page, limit: pagination.limit, total };
  }

  async get(driverUserId: string) {
    const driver = await prisma.user.findUnique({
      where: { id: driverUserId },
      include: { assignedBus: true },
    });
    if (!driver || driver.role !== 'driver') {
      throw new AppError('NOT_FOUND', 'Driver not found.', 404);
    }
    return driver;
  }

  async update(driverUserId: string, input: UpdateDriverInput) {
    await this.get(driverUserId); // throws NOT_FOUND if missing/not a driver
    return prisma.user.update({ where: { id: driverUserId }, data: input });
  }

  async setStatus(driverUserId: string, status: AccountStatus) {
    await this.get(driverUserId);
    return prisma.user.update({ where: { id: driverUserId }, data: { status } });
  }
}

export const driverService = new DriverService();
