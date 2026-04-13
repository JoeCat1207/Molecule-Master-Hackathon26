import { Router } from 'express';
import { getAllMolecules, getMoleculesByLevel, getMoleculeByCid, pubchemImageUrl } from '../services/moleculeService.js';
import { getRedactedHint } from '../services/hintService.js';

export const moleculeRoutes = Router();

moleculeRoutes.get('/', (req, res) => {
  const level = req.query.level ? parseInt(req.query.level as string, 10) : undefined;
  const molecules = level ? getMoleculesByLevel(level) : getAllMolecules();
  // Don't send answers to the client
  const safe = molecules.map(({ answers, ...rest }) => rest);
  res.json(safe);
});

moleculeRoutes.get('/:cid/image', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid, 10);
    const url = pubchemImageUrl(cid);
    const resp = await fetch(url);
    if (!resp.ok) {
      res.status(resp.status).json({ error: 'Failed to fetch image from PubChem' });
      return;
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to proxy PubChem image' });
  }
});

moleculeRoutes.get('/:cid/hint', async (req, res) => {
  const cid = parseInt(req.params.cid, 10);
  const molecule = getMoleculeByCid(cid);
  if (!molecule) {
    res.status(404).json({ error: 'Molecule not found' });
    return;
  }
  const hint = await getRedactedHint(molecule);
  res.json({ hint, source: 'wikipedia' });
});
