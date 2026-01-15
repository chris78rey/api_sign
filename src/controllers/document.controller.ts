import { createReadStream } from 'fs';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { DocumentService } from '../services/document.service';

export class DocumentController {
  public static async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const requestId = req.params.id;
      if (!requestId) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing request id' });
      }

      const result = await DocumentService.fetchAndStoreFinalDocument({
        requestId,
        organizationId: req.user.organizationId,
        actorUserId: req.user.userId,
      });

      res.status(200);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="final.pdf"');

      const stream = createReadStream(result.absolutePath);
      stream.on('error', (err) => next(err));
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}
