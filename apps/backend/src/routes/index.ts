import { Router } from 'express';
import { healthRouter } from './health.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);

// Phase 8 wires up the rest of API_DESIGN.md here, e.g.:
// apiRouter.use('/auth', authRouter);
// apiRouter.use('/users', usersRouter);
// apiRouter.use('/buses', busesRouter);
// apiRouter.use('/trips', tripsRouter);
// apiRouter.use('/notices', noticesRouter);
// apiRouter.use('/complaints', complaintsRouter);
// apiRouter.use('/admin', adminRouter);
// apiRouter.use('/driver', driverRouter);
