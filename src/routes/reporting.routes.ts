import { Router } from 'express';

import { requireAdmin } from '../middlewares/auth.middleware';
import { ReportingController } from '../controllers/reporting.controller';

export function buildReportingRouter(): Router {
  const router = Router();

  router.get('/reports/utility', requireAdmin, ReportingController.utility);

  return router;
}
