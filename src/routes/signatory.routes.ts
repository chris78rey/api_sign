import multer from 'multer';
import path from 'path';
import { Router } from 'express';
import fs from 'fs';

import { SignatoryController } from '../controllers/signatory.controller';

const tmpDir = path.join(process.cwd(), 'storage', '_tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export function buildSignatoryRouter(): Router {
  const router = Router();

  router.post('/requests/:id/signatories', upload.single('evidence'), SignatoryController.create);

  return router;
}
