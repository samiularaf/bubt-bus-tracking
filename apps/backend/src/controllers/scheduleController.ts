import type { Request, Response } from 'express';
import { scheduleService } from '../services/ScheduleService.js';
import { ok } from '../utils/respond.js';

export const scheduleController = {
  list: async (_req: Request, res: Response) => {
    ok(res, await scheduleService.listSchedules());
  },

  create: async (req: Request, res: Response) => {
    ok(res, await scheduleService.createSchedule(req.body), 201);
  },

  update: async (req: Request, res: Response) => {
    ok(res, await scheduleService.updateSchedule(req.params.id, req.body));
  },

  activate: async (req: Request, res: Response) => {
    await scheduleService.activateSchedule(req.params.id);
    ok(res, { activated: true });
  },

  listTemplates: async (req: Request, res: Response) => {
    ok(res, await scheduleService.listTemplates(req.params.id));
  },

  createTemplate: async (req: Request, res: Response) => {
    ok(res, await scheduleService.createTemplate(req.params.id, req.body), 201);
  },

  updateTemplate: async (req: Request, res: Response) => {
    ok(res, await scheduleService.updateTemplate(req.params.id, req.body));
  },

  deleteTemplate: async (req: Request, res: Response) => {
    await scheduleService.deleteTemplate(req.params.id);
    ok(res, { deleted: true });
  },
};
