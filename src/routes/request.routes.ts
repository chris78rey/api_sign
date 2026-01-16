import multer from 'multer';
import path from 'path';
import { Router } from 'express';
import fs from 'fs';

import { RequestController } from '../controllers/request.controller';

const tmpDir = path.join(process.cwd(), 'storage', '_tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export function buildRequestRouter(): Router {
  const router = Router();

  router.post('/', upload.single('pdf'), RequestController.create);
  router.get('/:id', RequestController.getById);
  router.patch('/:id/payment', RequestController.recordPayment);

  return router;
}
