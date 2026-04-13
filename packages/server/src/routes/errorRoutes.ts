import { Router } from 'express';
import { getErrorChallenges, checkErrors } from '../services/validationService.js';

export const errorRoutes = Router();

errorRoutes.get('/challenges', (req, res) => {
  const level = req.query.level ? parseInt(req.query.level as string, 10) : undefined;
  const challenges = getErrorChallenges(level);
  // Remove answer data before sending
  const safe = challenges.map(({ errorAtomIds, errorBondIds, explanations, ...rest }: any) => rest);
  res.json(safe);
});

errorRoutes.post('/check', (req, res) => {
  const { challengeId, flaggedAtomIds, flaggedBondIds } = req.body;
  if (!challengeId) {
    res.status(400).json({ error: 'challengeId is required' });
    return;
  }
  const result = checkErrors(challengeId, flaggedAtomIds ?? [], flaggedBondIds ?? []);
  res.json(result);
});
