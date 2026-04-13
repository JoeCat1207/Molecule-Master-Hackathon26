import { Router } from 'express';
import { createSession, getSession, updateSession } from '../services/sessionService.js';

export const gameRoutes = Router();

gameRoutes.post('/session', (_req, res) => {
  const session = createSession();
  res.json(session);
});

gameRoutes.get('/session/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

gameRoutes.put('/session/:id', (req, res) => {
  const session = updateSession(req.params.id, req.body);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});
