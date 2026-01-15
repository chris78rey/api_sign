import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { SendService } from '../services/send.service';

export class SendController {
  public static async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing auth context' });
      }

      const requestId = req.params.id;
      if (!requestId) {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing request id' });
      }

      await SendService.sendRequest({ requestId, organizationId: req.user.organizationId, actorUserId: req.user.userId });
      res.status(200).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
}
