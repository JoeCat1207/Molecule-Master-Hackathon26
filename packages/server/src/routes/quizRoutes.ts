import { Router } from 'express';
import { checkAnswer } from '../services/moleculeService.js';

export const quizRoutes = Router();

quizRoutes.post('/check', (req, res) => {
  const { cid, guess } = req.body;
  if (!cid || !guess) {
    res.status(400).json({ error: 'cid and guess are required' });
    return;
  }

  const { correct, molecule } = checkAnswer(cid, guess);

  if (!molecule) {
    res.status(404).json({ error: 'Molecule not found' });
    return;
  }

  const score = correct ? molecule.level * 10 : 0;

  res.json({
    correct,
    score,
    feedback: correct
      ? `Correct! That is ${molecule.display}.`
      : `Not quite. The formula is ${molecule.formula}. Try again!`,
    ...(correct ? {} : { formula: molecule.formula }),
  });
});
