import { Router } from 'express';

import { requireAdmin } from '../middlewares/auth.middleware';
import { OrgPolicyController } from '../controllers/orgPolicy.controller';

export function buildOrgPolicyRouter(): Router {
  const router = Router();

  router.get('/organization/policy', requireAdmin, OrgPolicyController.get);
  router.patch('/organization/policy', requireAdmin, OrgPolicyController.update);

  return router;
}
