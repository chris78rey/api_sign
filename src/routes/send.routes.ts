import { Router } from 'express';

import { SendController } from '../controllers/send.controller';

export function buildSendRouter(): Router {
  const router = Router();

  router.post('/requests/:id/send', SendController.send);

  return router;
}
