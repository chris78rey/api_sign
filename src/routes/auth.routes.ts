import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';

export function buildAuthRouter(): Router {
  const router = Router();

  router.post('/auth/register', AuthController.register);
  router.post('/auth/login', AuthController.login);

  return router;
}
