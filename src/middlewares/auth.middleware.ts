import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { ApiError } from '../errors/ApiError';

export type AuthenticatedUser = {
  userId: string;
  organizationId: string;
  role: 'ADMIN' | 'USER';
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError({ statusCode: 500, code: 'JWT_SECRET_MISSING', message: 'JWT_SECRET is not configured' });
  }
  return secret;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header) {
    next(new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing Authorization header' }));
    return;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    next(new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid Authorization header' }));
    return;
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret());
    if (typeof payload !== 'object' || payload === null) {
      throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid token payload' });
    }

    const { userId, organizationId, role } = payload as Partial<AuthenticatedUser>;
    if (!userId || !organizationId || (role !== 'ADMIN' && role !== 'USER')) {
      throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid token claims' });
    }

    req.user = { userId, organizationId, role };
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
      return;
    }

    next(new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid token' }));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' }));
    return;
  }

  if (req.user.role !== 'ADMIN') {
    next(new ApiError({ statusCode: 403, code: 'FORBIDDEN', message: 'Admin role required' }));
    return;
  }

  next();
}
