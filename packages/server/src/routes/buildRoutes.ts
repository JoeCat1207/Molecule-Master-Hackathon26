import { Router } from 'express';
import { validate, getBuildChallenges, checkBuild } from '../services/validationService.js';

export const buildRoutes = Router();

buildRoutes.get('/challenges', (req, res) => {
  const level = req.query.level ? parseInt(req.query.level as string, 10) : undefined;
  res.json(getBuildChallenges(level));
});

buildRoutes.post('/validate', (req, res) => {
  const { atoms, bonds } = req.body;
  if (!atoms || !bonds) {
    res.status(400).json({ error: 'atoms and bonds are required' });
    return;
  }
  const result = validate({ atoms, bonds });
  res.json(result);
});

buildRoutes.post('/check', (req, res) => {
  const { challengeId, atoms, bonds } = req.body;
  if (!challengeId || !atoms || !bonds) {
    res.status(400).json({ error: 'challengeId, atoms, and bonds are required' });
    return;
  }
  const result = checkBuild(challengeId, { atoms, bonds });
  res.json(result);
});
