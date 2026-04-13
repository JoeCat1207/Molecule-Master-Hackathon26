export type GamePhase = 'menu' | 'quiz' | 'build' | 'error' | 'results';
export type GameMode = 'quiz' | 'build' | 'error';

export interface MoleculeData {
  cid: number;
  display: string;
  wiki: string;
  answers: string[];
  formula: string;
  level: number;
}

export interface BuildChallenge {
  id: string;
  level: number;
  targetName: string;
  targetFormula: string;
  targetCid: number;
  hint?: string;
  expectedAtoms: Record<string, number>; // e.g. { C: 2, H: 6, O: 1 }
}

export interface ErrorChallenge {
  id: string;
  level: number;
  moleculeName: string;
  description: string;
  atoms: { id: string; element: string; x: number; y: number }[];
  bonds: { id: string; source: string; target: string; order: 1 | 2 | 3 }[];
  errorAtomIds: string[];
  errorBondIds: string[];
  explanations: string[];
}

export interface ChallengeResult {
  challengeId: string;
  mode: GameMode;
  correct: boolean;
  score: number;
  attempts: number;
  partialCredit?: number;
}

export interface GameSession {
  id: string;
  score: number;
  level: number;
  streak: number;
  xp: number;
  xpToNextLevel: number;
  correctThisLevel: number;
  completedChallenges: string[];
  history: ChallengeResult[];
}

export const CORRECT_PER_LEVEL = 3;
export const POINTS_PER_LEVEL = 10;
export const MAX_LEVEL = 5;
