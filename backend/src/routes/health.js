import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'CareWeave',
    version: '2.0.0',
  });
});

export default router;
