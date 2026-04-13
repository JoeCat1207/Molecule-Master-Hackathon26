import type { ValidationResult } from './chemistry.js';

export interface QuizCheckRequest {
  cid: number;
  guess: string;
}

export interface QuizCheckResponse {
  correct: boolean;
  score: number;
  feedback: string;
  correctAnswer?: string;
  formula?: string;
}

export interface BuildValidateRequest {
  atoms: { id: string; element: string; x: number; y: number }[];
  bonds: { id: string; source: string; target: string; order: 1 | 2 | 3 }[];
}

export interface BuildValidateResponse extends ValidationResult {}

export interface BuildCheckRequest {
  challengeId: string;
  atoms: { id: string; element: string; x: number; y: number }[];
  bonds: { id: string; source: string; target: string; order: 1 | 2 | 3 }[];
}

export interface BuildCheckResponse {
  correct: boolean;
  score: number;
  partialCredit: number;
  feedback: string;
  validation: ValidationResult;
}

export interface ErrorCheckRequest {
  challengeId: string;
  flaggedAtomIds: string[];
  flaggedBondIds: string[];
}

export interface ErrorCheckResponse {
  correct: boolean;
  score: number;
  partialCredit: number;
  feedback: string;
  missedErrors: string[];
  falsePositives: string[];
}

export interface HintResponse {
  hint: string;
  source: 'wikipedia' | 'ai' | 'fallback';
}
