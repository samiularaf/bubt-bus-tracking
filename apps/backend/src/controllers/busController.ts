import type { Request, Response } from 'express';
import { busService } from '../services/BusService.js';
import { ok } from '../utils/respond.js';

export const busController = {
  list: async (_req: Request, res: Response) => {
    ok(res, await busService.listBuses());
  },

  search: async (req: Request, res: Response) => {
    ok(res, await busService.searchBuses(String(req.query.q ?? '')));
  },

  detail: async (req: Request, res: Response) => {
    ok(res, await busService.getBusDetail(req.params.id));
  },

  create: async (req: Request, res: Response) => {
    ok(res, await busService.createBus(req.body), 201);
  },

  update: async (req: Request, res: Response) => {
    ok(res, await busService.updateBus(req.params.id, req.body));
  },

  setStatus: async (req: Request, res: Response) => {
    ok(res, await busService.setBusStatus(req.params.id, req.body.status === 'active'));
  },

  listRoutes: async (_req: Request, res: Response) => {
    ok(res, await busService.listRoutes());
  },

  routeStops: async (req: Request, res: Response) => {
    ok(res, await busService.getRouteStops(req.params.id));
  },

  searchStops: async (req: Request, res: Response) => {
    ok(res, await busService.searchStops(String(req.query.q ?? '')));
  },

  createRoute: async (req: Request, res: Response) => {
    ok(res, await busService.createRoute(req.body), 201);
  },

  updateRoute: async (req: Request, res: Response) => {
    ok(res, await busService.updateRoute(req.params.id, req.body));
  },

  addStop: async (req: Request, res: Response) => {
    ok(res, await busService.addStop(req.params.id, req.body), 201);
  },

  updateStop: async (req: Request, res: Response) => {
    ok(res, await busService.updateStop(req.params.id, req.body));
  },

  deleteStop: async (req: Request, res: Response) => {
    await busService.deleteStop(req.params.id);
    ok(res, { deleted: true });
  },
};
