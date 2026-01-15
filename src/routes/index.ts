import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';
import { buildAuthRouter } from './auth.routes';
import { buildDebugRouter } from './debug.routes';
import { buildHealthRouter } from './health.routes';
import { buildRequestRouter } from './request.routes';
import { buildDocumentRouter } from './document.routes';
import { buildReportingRouter } from './reporting.routes';
import { buildOrgPolicyRouter } from './orgPolicy.routes';
import { buildSendRouter } from './send.routes';
import { buildSignatoryRouter } from './signatory.routes';


export function buildRouter(): Router {
  const router = Router();

  router.use(buildHealthRouter());
  router.use(buildDebugRouter());

  router.use('/api', buildAuthRouter());

  router.use('/api', authMiddleware);
  router.use('/api/requests', buildRequestRouter());
  router.use('/api', buildSignatoryRouter());
  router.use('/api', buildSendRouter());
  router.use('/api', buildDocumentRouter());
  router.use('/api/admin', buildReportingRouter());
  router.use('/api/admin', buildOrgPolicyRouter());

  return router;
}
