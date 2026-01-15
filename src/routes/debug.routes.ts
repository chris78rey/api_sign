import path from 'path';
import { Router } from 'express';

export function buildDebugRouter(): Router {
  const router = Router();

  router.get('/debug', (_req, res) => {
    if ((process.env.NODE_ENV ?? 'development') !== 'development') {
      res.status(404).end();
      return;
    }

    const filePath = path.resolve(process.cwd(), 'src', 'public', 'debug.html');
    res.sendFile(filePath);
  });

  return router;
}
