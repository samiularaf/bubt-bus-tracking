import type { Request, Response } from 'express';
import { noticeService } from '../services/NoticeService.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { PaginationQuery } from '../validation/misc.js';
import type { NoticeCategory } from '@prisma/client';

export const noticeController = {
  list: async (req: Request, res: Response) => {
    const category = req.query.category as NoticeCategory | undefined;
    ok(res, await noticeService.list(req.query as unknown as PaginationQuery, category));
  },

  detail: async (req: Request, res: Response) => {
    ok(res, await noticeService.get(req.params.id));
  },

  publish: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await noticeService.publish(req.user!.id, req.body), 201);
  },

  update: async (req: Request, res: Response) => {
    ok(res, await noticeService.update(req.params.id, req.body));
  },

  remove: async (req: Request, res: Response) => {
    await noticeService.delete(req.params.id);
    ok(res, { deleted: true });
  },
};
