import { prisma } from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { getIO } from '../sockets/io.js';
import type { PositionInput } from '../validation/trip.js';

/** Only persist a GPS point to the DB every N seconds per trip — every point still broadcasts live. */
const PERSIST_INTERVAL_MS = 10_000;
const lastPersistedAt = new Map<string, number>();

export class TrackingService {
  /**
   * Core GPS ingestion path, used by both the REST flush endpoint and the
   * Socket.IO driver:position event. Broadcasts every point live to the
   * trip's room and the admin fleet-monitoring room; only writes to
   * trip_positions on a debounce, per the confirmed Phase 0 cost decision.
   */
  async ingestPosition(tripId: string, position: PositionInput): Promise<void> {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError('NOT_FOUND', 'Trip not found.', 404);
    if (trip.status !== 'running') {
      throw new AppError(
        'TRIP_NOT_RUNNING',
        'Cannot record a position for a trip that is not running.',
        409,
      );
    }

    this.broadcastPosition(tripId, position);
    await this.persistPositionDebounced(tripId, position);
  }

  broadcastPosition(tripId: string, position: PositionInput): void {
    const payload = {
      tripId,
      lat: position.lat,
      lng: position.lng,
      speedKmh: position.speedKmh ?? null,
      timestamp: position.timestamp,
    };
    const io = getIO();
    io.to(`trip:${tripId}`).emit('trip:position', payload);
    io.to('admin:live').emit('trip:position', payload);
  }

  private async persistPositionDebounced(tripId: string, position: PositionInput): Promise<void> {
    const now = Date.now();
    const last = lastPersistedAt.get(tripId) ?? 0;
    if (now - last < PERSIST_INTERVAL_MS) return;

    lastPersistedAt.set(tripId, now);
    await prisma.tripPosition.create({
      data: {
        tripId,
        latitude: position.lat,
        longitude: position.lng,
        speedKmh: position.speedKmh,
        recordedAt: new Date(position.timestamp),
      },
    });
  }

  /** Flushes a batch of GPS points cached on-device while the driver was offline, per PROJECT_RULES.md. */
  async flushOfflineQueue(tripId: string, positions: PositionInput[]): Promise<void> {
    for (const position of positions.sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
      await this.ingestPosition(tripId, { ...position, queued: true });
    }
  }

  clearDebounceState(tripId: string): void {
    lastPersistedAt.delete(tripId);
  }
}

export const trackingService = new TrackingService();
