import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@bubt/shared-types';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
  };
}

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  mustChangePassword: boolean;
}

/** Verifies the JWT access token; attaches `req.user` on success. */
export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Missing or malformed Authorization header.', 401);
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
    req.user = {
      id: payload.sub,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword,
    };
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired access token.', 401);
  }
}

/** Declares which role(s) may access a route. Use after requireAuth. */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('FORBIDDEN', 'You do not have access to this resource.', 403);
    }
    next();
  };
}

/** Blocks drivers who haven't completed their forced first-login password change. */
export function blockIfMustChangePassword(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (req.user?.mustChangePassword) {
    throw new AppError(
      'MUST_CHANGE_PASSWORD',
      'You must change your password before continuing.',
      403,
    );
  }
  next();
}
