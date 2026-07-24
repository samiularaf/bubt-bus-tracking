import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@bubt/shared-types';

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function setIO(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
  ioInstance = io;
}

/** Throws if called before initSocketServer() has run — a genuine startup-order bug, not a soft failure. */
export function getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
  if (!ioInstance) {
    throw new Error('Socket.IO server accessed before initialization.');
  }
  return ioInstance;
}
