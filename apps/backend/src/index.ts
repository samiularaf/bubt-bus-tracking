import { createServer } from 'node:http';
import { createApp } from './app.js';
import { initSocketServer } from './sockets/index.js';
import { startReminderCheckJob } from './jobs/reminderCheck.js';
import { startPositionRetentionJob } from './jobs/positionRetention.js';
import { env } from './config/env.js';

const app = createApp();
const httpServer = createServer(app);
initSocketServer(httpServer);

startReminderCheckJob();
startPositionRetentionJob();

httpServer.listen(env.port, () => {
  console.log(`[backend] listening on port ${env.port} (${env.nodeEnv})`);
});
