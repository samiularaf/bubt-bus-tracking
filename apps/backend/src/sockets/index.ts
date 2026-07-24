import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@bubt/shared-types';
import { env } from '../config/env.js';
import { setIO } from './io.js';
import { trackingService } from '../services/TrackingService.js';

/**
 * Room strategy (ARCHITECTURE.md §7):
 *  - `trip:<tripId>` — driver broadcasts to it, users viewing that trip join it
 *  - `admin:live`    — fleet-wide monitoring, receives every trip's position updates
 *  - `broadcast:all` — emergency alerts go to every connected client
 */
export function initSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: env.corsOrigin },
  });

  setIO(io);

  io.on('connection', (socket) => {
    socket.on('trip:join', ({ tripId }: { tripId: string }) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on('trip:leave', ({ tripId }: { tripId: string }) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on('admin:live:subscribe', () => {
      socket.join('admin:live');
    });

    socket.on('driver:position', (payload) => {
      // Fire-and-forget over the socket: a malformed/late point shouldn't
      // drop the driver's connection. Errors are logged, not thrown further.
      const position = { ...payload, speedKmh: payload.speedKmh ?? undefined };
      trackingService.ingestPosition(payload.tripId, position).catch((err) => {
        console.error(`[socket] failed to ingest position for trip ${payload.tripId}:`, err);
      });
    });
  });

  return io;
}
