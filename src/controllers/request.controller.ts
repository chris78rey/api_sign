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
}
