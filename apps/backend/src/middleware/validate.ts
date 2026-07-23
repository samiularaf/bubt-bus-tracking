import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from './errorHandler.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates req[target] against a Zod schema, replacing it with the parsed
 * (and type-coerced) result on success. On failure, throws a VALIDATION_ERROR
 * AppError with a readable message, per API_DESIGN.md §10.
 */
export function validate(schema: ZodType, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
        : 'Invalid request.';
      throw new AppError('VALIDATION_ERROR', message, 400);
    }
    req[target] = result.data;
    next();
  };
}
