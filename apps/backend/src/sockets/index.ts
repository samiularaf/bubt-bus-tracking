import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@bubt/shared-types';
import { env } from '../config/env.js';

/**
 * Room strategy (ARCHITECTURE.md §7):
 *  - `trip:<tripId>` — driver broadcasts to it, users viewing that trip join it
 *  - `admin:live`    — fleet-wide monitoring, receives every trip's position updates
 *  - `broadcast:all` — emergency alerts go to every connected client
 *
 * Actual event handler logic (persisting positions, generating ETA, etc.) is
 * wired up in Phase 9 — this is the connection/room scaffolding only.
 */
export function initSocketServer(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: env.corsOrigin },
  });

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

    // Phase 9: socket.on('driver:position', ...) → TrackingService → broadcast + debounced persist
  });

  return io;
}
