import { Router } from 'express';
import { moleculeRoutes } from './moleculeRoutes.js';
import { quizRoutes } from './quizRoutes.js';
import { buildRoutes } from './buildRoutes.js';
import { errorRoutes } from './errorRoutes.js';
import { gameRoutes } from './gameRoutes.js';
import { aiRoutes } from './aiRoutes.js';

export const router = Router();

router.use('/molecules', moleculeRoutes);
router.use('/quiz', quizRoutes);
router.use('/build', buildRoutes);
router.use('/errors', errorRoutes);
router.use('/game', gameRoutes);
router.use('/ai', aiRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Molecule Master API' });
});
