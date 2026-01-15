import { Router } from 'express';

export function buildHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  });

  return router;
}
