import {
  validateMolecule,
  parseFormula,
  atomCountsFromGraph,
  type MoleculeGraph,
  type ValidationResult,
  type BuildChallenge,
} from '@molecule-master/shared';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildPath = join(__dirname, '..', 'data', 'buildChallenges.json');
const errorPath = join(__dirname, '..', 'data', 'errorChallenges.json');

const buildChallenges: BuildChallenge[] = JSON.parse(readFileSync(buildPath, 'utf-8'));
const errorChallenges = JSON.parse(readFileSync(errorPath, 'utf-8'));

export function validate(graph: MoleculeGraph): ValidationResult {
  return validateMolecule(graph);
}

export function getBuildChallenges(level?: number): BuildChallenge[] {
  if (level !== undefined) {
    return buildChallenges.filter((c) => c.level <= level);
  }
  return buildChallenges;
}

export function checkBuild(
  challengeId: string,
  graph: MoleculeGraph
): { correct: boolean; partialCredit: number; feedback: string; validation: ValidationResult } {
  const challenge = buildChallenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return {
      correct: false,
      partialCredit: 0,
      feedback: 'Challenge not found',
      validation: validateMolecule(graph),
    };
  }

  const validation = validateMolecule(graph);
  const builtCounts = atomCountsFromGraph(graph);
  const targetCounts = challenge.expectedAtoms;

  // Check if formula matches
  const formulaMatch = Object.keys(targetCounts).every(
    (el) => builtCounts[el] === targetCounts[el]
  ) && Object.keys(builtCounts).every(
    (el) => targetCounts[el] === builtCounts[el]
  );

  // Calculate partial credit
  const totalTargetAtoms = Object.values(targetCounts).reduce((a, b) => a + b, 0);
  const satisfiedAtoms = Object.values(validation.atomStatuses).filter((s) => s.satisfied).length;
  const partialCredit = graph.atoms.length > 0 ? satisfiedAtoms / graph.atoms.length : 0;

  const correct = formulaMatch && validation.complete;

  let feedback: string;
  if (correct) {
    feedback = `Correct! You built ${challenge.targetName} (${challenge.targetFormula})!`;
  } else if (formulaMatch && !validation.complete) {
    feedback = `Right atoms, but some bonds are incorrect. Check the valence of each atom.`;
  } else {
    const builtFormula = validation.formula || 'nothing yet';
    feedback = `You built ${builtFormula}, but the target is ${challenge.targetFormula}. ${validation.errors.length > 0 ? validation.errors[0].message : ''}`;
  }

  return { correct, partialCredit, feedback, validation };
}

export function getErrorChallenges(level?: number) {
  if (level !== undefined) {
    return errorChallenges.filter((c: any) => c.level <= level);
  }
  return errorChallenges;
}

export function checkErrors(
  challengeId: string,
  flaggedAtomIds: string[],
  flaggedBondIds: string[]
): { correct: boolean; partialCredit: number; feedback: string; missedErrors: string[]; falsePositives: string[] } {
  const challenge = errorChallenges.find((c: any) => c.id === challengeId);
  if (!challenge) {
    return { correct: false, partialCredit: 0, feedback: 'Challenge not found', missedErrors: [], falsePositives: [] };
  }

  const expectedAtoms = new Set(challenge.errorAtomIds);
  const expectedBonds = new Set(challenge.errorBondIds);
  const flaggedA = new Set(flaggedAtomIds);
  const flaggedB = new Set(flaggedBondIds);

  const missedAtoms = [...expectedAtoms].filter((id: string) => !flaggedA.has(id));
  const missedBonds = [...expectedBonds].filter((id: string) => !flaggedB.has(id));
  const falseAtoms = flaggedAtomIds.filter((id) => !expectedAtoms.has(id));
  const falseBonds = flaggedBondIds.filter((id) => !expectedBonds.has(id));

  const totalErrors = expectedAtoms.size + expectedBonds.size;
  const foundErrors = totalErrors - missedAtoms.length - missedBonds.length;
  const partialCredit = totalErrors > 0 ? Math.max(0, foundErrors - falseAtoms.length - falseBonds.length) / totalErrors : 0;

  const correct = missedAtoms.length === 0 && missedBonds.length === 0 && falseAtoms.length === 0 && falseBonds.length === 0;

  const missedErrors = [...missedAtoms.map((id: string) => `Missed atom: ${id}`), ...missedBonds.map((id: string) => `Missed bond: ${id}`)];
  const falsePositives = [...falseAtoms.map((id) => `${id} is actually correct`), ...falseBonds.map((id) => `Bond ${id} is actually correct`)];

  let feedback: string;
  if (correct) {
    feedback = `You found all the errors! ${challenge.explanations[0]}`;
  } else if (foundErrors > 0) {
    feedback = `You found ${foundErrors} of ${totalErrors} errors. ${challenge.explanations[0]}`;
  } else {
    feedback = `You didn't find the errors. ${challenge.explanations[0]}`;
  }

  return { correct, partialCredit, feedback, missedErrors, falsePositives };
}
