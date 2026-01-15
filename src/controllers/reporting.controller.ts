import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { ReportingService } from '../services/reporting.service';

export class ReportingController {
  public static async utility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const month = req.query.month;
      if (typeof month !== 'string') {
        throw new ApiError({ statusCode: 400, code: 'BAD_REQUEST', message: 'Missing month query param' });
      }

      const report = await ReportingService.utilityReport({ month });
      res.status(200).json({ ok: true, month, report });
    } catch (err) {
      next(err);
    }
  }
}
