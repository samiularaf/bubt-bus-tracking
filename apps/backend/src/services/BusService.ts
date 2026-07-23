import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateBusInput,
  UpdateBusInput,
  CreateRouteInput,
  UpdateRouteInput,
  CreateStopInput,
  UpdateStopInput,
} from '../validation/bus.js';

export class BusService {
  async listBuses() {
    return prisma.bus.findMany({ where: { isActive: true }, include: { route: true } });
  }

  async searchBuses(query: string) {
    return prisma.bus.findMany({
      where: {
        isActive: true,
        OR: [
          { busNumber: { contains: query, mode: 'insensitive' } },
          { route: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { route: true },
    });
  }

  async getBusDetail(busId: string) {
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { route: { include: { stops: { orderBy: { stopOrder: 'asc' } } } }, driver: true },
    });
    if (!bus) throw new AppError('NOT_FOUND', 'Bus not found.', 404);
    return bus;
  }

  async listRoutes() {
    return prisma.route.findMany();
  }

  async getRouteStops(routeId: string) {
    return prisma.stop.findMany({ where: { routeId }, orderBy: { stopOrder: 'asc' } });
  }

  async searchStops(query: string) {
    return prisma.stop.findMany({ where: { name: { contains: query, mode: 'insensitive' } } });
  }

  // --- Admin ---

  async createBus(input: CreateBusInput) {
    const route = await prisma.route.findUnique({ where: { id: input.routeId } });
    if (!route) throw new AppError('NOT_FOUND', 'Route not found.', 404);

    const existing = await prisma.bus.findUnique({ where: { busNumber: input.busNumber } });
    if (existing) throw new AppError('CONFLICT', 'A bus with this number already exists.', 409);

    return prisma.bus.create({ data: input });
  }

  async updateBus(busId: string, input: UpdateBusInput) {
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new AppError('NOT_FOUND', 'Bus not found.', 404);
    return prisma.bus.update({ where: { id: busId }, data: input });
  }

  async setBusStatus(busId: string, isActive: boolean) {
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new AppError('NOT_FOUND', 'Bus not found.', 404);
    return prisma.bus.update({ where: { id: busId }, data: { isActive } });
  }

  async createRoute(input: CreateRouteInput) {
    return prisma.route.create({ data: input });
  }

  async updateRoute(routeId: string, input: UpdateRouteInput) {
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new AppError('NOT_FOUND', 'Route not found.', 404);
    return prisma.route.update({ where: { id: routeId }, data: input });
  }

  async addStop(routeId: string, input: CreateStopInput) {
    const route = await prisma.route.findUnique({ where: { id: routeId } });
    if (!route) throw new AppError('NOT_FOUND', 'Route not found.', 404);
    return prisma.stop.create({ data: { ...input, routeId } });
  }

  async updateStop(stopId: string, input: UpdateStopInput) {
    const stop = await prisma.stop.findUnique({ where: { id: stopId } });
    if (!stop) throw new AppError('NOT_FOUND', 'Stop not found.', 404);
    return prisma.stop.update({ where: { id: stopId }, data: input });
  }

  async deleteStop(stopId: string): Promise<void> {
    const stop = await prisma.stop.findUnique({ where: { id: stopId } });
    if (!stop) throw new AppError('NOT_FOUND', 'Stop not found.', 404);
    await prisma.stop.delete({ where: { id: stopId } });
  }
}

export const busService = new BusService();
