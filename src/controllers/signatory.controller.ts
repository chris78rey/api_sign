import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { SignatoryService } from '../services/signatory.service';

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: `Invalid ${field}` });
  }
  return value;
}

export class SignatoryController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const requestId = req.params.id;
      if (!requestId) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing request id' });
      }

      const name = requireString(req.body?.name, 'name');
      const email = requireString(req.body?.email, 'email');
      const dni = requireString(req.body?.dni, 'dni');
      const phone = typeof req.body?.phone === 'string' ? req.body.phone : undefined;

      const x = optionalNumber(req.body?.x);
      const y = optionalNumber(req.body?.y);
      const page = optionalNumber(req.body?.page);

      const evidenceFile = req.file
        ? { mimetype: req.file.mimetype, size: req.file.size, path: req.file.path }
        : undefined;

      const result = await SignatoryService.addSignatory({
        requestId,
        organizationId: req.user.organizationId,
        actorUserId: req.user.userId,
        name,
        email,
        phone,
        dni,
        override: { x, y, page },
        evidenceFile,
      });

      res.status(201).json({ ok: true, id: result.id });
    } catch (err) {
      next(err);
    }
  }
}
