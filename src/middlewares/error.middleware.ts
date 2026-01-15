import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ ok: false, code: err.code, message: err.message, detail: err.detail });
    return;
  }

  res.status(500).json({ ok: false, code: 'INTERNAL_ERROR', message: 'Internal Server Error' });
}
