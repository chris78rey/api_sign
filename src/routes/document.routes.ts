import { Router } from 'express';

import { DocumentController } from '../controllers/document.controller';

export function buildDocumentRouter(): Router {
  const router = Router();

  router.get('/requests/:id/document', DocumentController.download);

  return router;
}
