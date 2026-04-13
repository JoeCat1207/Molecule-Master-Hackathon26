import { Router } from 'express';
import { getMoleculeByCid } from '../services/moleculeService.js';
import { getAiHint } from '../services/aiService.js';

export const aiRoutes = Router();

aiRoutes.post('/hint', async (req, res) => {
  const { cid, wrongAttempts } = req.body;
  if (!cid) {
    res.status(400).json({ error: 'cid is required' });
    return;
  }
  const molecule = getMoleculeByCid(cid);
  if (!molecule) {
    res.status(404).json({ error: 'Molecule not found' });
    return;
  }
  const hint = await getAiHint(molecule, wrongAttempts ?? 3);
  res.json({ hint, source: process.env.OPENAI_API_KEY ? 'ai' : 'fallback' });
});
