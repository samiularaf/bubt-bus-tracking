import type { NextFunction, Request, Response } from 'express';
import type { ApiErrorCode } from '@bubt/shared-types';

/**
 * Services throw AppError; this middleware maps it to the standard response
 * envelope from API_DESIGN.md §1/§10. No raw stack traces ever reach the client.
 */
export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

const DEFAULT_STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  OTP_INVALID_OR_EXPIRED: 400,
  TRIP_ALREADY_STARTED: 409,
  TRIP_NOT_RUNNING: 409,
  SCHEDULE_ALREADY_ACTIVE: 409,
  RATE_LIMITED: 429,
  MUST_CHANGE_PASSWORD: 403,
  INTERNAL_ERROR: 500,
};

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { code: err.code, message: err.message },
    });
  }

  console.error('[unhandled error]', err);

  return res.status(DEFAULT_STATUS_BY_CODE.INTERNAL_ERROR).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
}
