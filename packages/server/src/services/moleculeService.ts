import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { MoleculeData } from '@molecule-master/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data', 'molecules.json');

const molecules: MoleculeData[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

export function getAllMolecules(): MoleculeData[] {
  return molecules;
}

export function getMoleculesByLevel(level: number): MoleculeData[] {
  return molecules.filter((m) => m.level === level);
}

export function getMoleculeByCid(cid: number): MoleculeData | undefined {
  return molecules.find((m) => m.cid === cid);
}

export function checkAnswer(cid: number, guess: string): { correct: boolean; molecule: MoleculeData | undefined } {
  const molecule = getMoleculeByCid(cid);
  if (!molecule) return { correct: false, molecule: undefined };

  const normalized = guess.toLowerCase().trim();
  const correct = molecule.answers.includes(normalized);
  return { correct, molecule };
}

/** PubChem image URL for a given CID. */
export function pubchemImageUrl(cid: number): string {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=large`;
}
