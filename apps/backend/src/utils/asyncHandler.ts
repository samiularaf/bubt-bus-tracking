import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 does not automatically catch rejected promises from async route
 * handlers and forward them to error-handling middleware — without this
 * wrapper, a thrown AppError inside an async controller would become an
 * unhandled rejection instead of a clean JSON error response.
 */
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
