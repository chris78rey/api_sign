import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { RequestService } from '../services/request.service';

export class RequestController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const file = req.file;
      if (!file) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing pdf file' });
      }

      const result = await RequestService.createRequest({
        organizationId: req.user.organizationId,
        actorUserId: req.user.userId,
        uploadedPdf: {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
        },
      });

      res.status(201).json({ ok: true, id: result.id });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const id = req.params.id;
      if (!id) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing id' });
      }

      const request = await RequestService.getRequest({ id, organizationId: req.user.organizationId });
      res.status(200).json({ ok: true, request });
    } catch (err) {
      next(err);
    }
  }

  public static async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const id = req.params.id;
      if (!id) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing id' });
      }

      const body = req.body as { amountPaidCents?: unknown; amountPaid?: unknown; currency?: unknown; reference?: unknown };

      let amountPaidCents: number;
      if (typeof body.amountPaidCents === 'number' && Number.isInteger(body.amountPaidCents)) {
        amountPaidCents = body.amountPaidCents;
      } else if (typeof body.amountPaid === 'number') {
        amountPaidCents = Math.round(body.amountPaid * 100);
      } else if (typeof body.amountPaid === 'string' && body.amountPaid.trim() !== '') {
        const parsed = Number(body.amountPaid);
        if (!Number.isFinite(parsed)) {
          throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'amountPaid must be a number' });
        }
        amountPaidCents = Math.round(parsed * 100);
      } else {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing amountPaid (or amountPaidCents)' });
      }

      if (!Number.isInteger(amountPaidCents) || amountPaidCents < 0) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'amountPaidCents must be a non-negative integer' });
      }

      const currency = typeof body.currency === 'string' && body.currency.trim() ? body.currency.trim().toUpperCase() : 'USD';
      const reference = typeof body.reference === 'string' && body.reference.trim() ? body.reference.trim() : undefined;

      const updated = await RequestService.recordPayment({
        id,
        organizationId: req.user.organizationId,
        actorUserId: req.user.userId,
        amountPaidCents,
        currency,
        reference,
      });

      res.status(200).json({ ok: true, request: updated });
    } catch (err) {
      next(err);
    }
  }
}
