import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { getPrismaClient } from '../lib/prisma';

export class OrgPolicyController {
  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const prisma = getPrismaClient();
      const org = await prisma.organization.findUnique({
        where: { id: req.user.organizationId },
        select: { evidenceRequiredDefault: true },
      });

      if (!org) {
        throw new ApiError({ statusCode: 404, code: 'ORG_NOT_FOUND', message: 'Organization not found' });
      }

      res.status(200).json({ ok: true, evidenceRequiredDefault: org.evidenceRequiredDefault });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const value = (req.body as { evidenceRequiredDefault?: unknown })?.evidenceRequiredDefault;
      if (typeof value !== 'boolean') {
        throw new ApiError({
          statusCode: 400,
          code: 'BAD_REQUEST',
          message: 'evidenceRequiredDefault must be boolean',
        });
      }

      const prisma = getPrismaClient();
      await prisma.organization.update({
        where: { id: req.user.organizationId },
        data: { evidenceRequiredDefault: value },
      });

      res.status(200).json({ ok: true, evidenceRequiredDefault: value });
    } catch (err) {
      next(err);
    }
  }
}
