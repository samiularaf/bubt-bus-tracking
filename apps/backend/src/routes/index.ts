import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { userRouter } from './users.js';
import { busRouter } from './buses.js';
import { tripRouter } from './trips.js';
import { scheduleRouter } from './schedules.js';
import { noticeAndComplaintRouter } from './notices.js';
import { driverRouter } from './drivers.js';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(userRouter);
apiRouter.use(busRouter);
apiRouter.use(tripRouter);
apiRouter.use(scheduleRouter);
apiRouter.use(noticeAndComplaintRouter);
apiRouter.use(driverRouter);
