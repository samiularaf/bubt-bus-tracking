import type { Request, Response } from 'express';
import { complaintService } from '../services/ComplaintService.js';
import { ok } from '../utils/respond.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { PaginationQuery } from '../validation/misc.js';

export const complaintController = {
  submit: async (req: AuthenticatedRequest, res: Response) => {
    ok(res, await complaintService.submit(req.user!.id, req.body), 201);
  },

  list: async (req: Request, res: Response) => {
    ok(res, await complaintService.list(req.query as unknown as PaginationQuery));
  },
};
