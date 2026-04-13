// Types
export type {
  Atom,
  Bond,
  MoleculeGraph,
  AtomStatus,
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from './types/chemistry.js';

export type {
  GamePhase,
  GameMode,
  MoleculeData,
  BuildChallenge,
  ErrorChallenge,
  ChallengeResult,
  GameSession,
} from './types/game.js';

export { CORRECT_PER_LEVEL, POINTS_PER_LEVEL, MAX_LEVEL } from './types/game.js';

export type {
  QuizCheckRequest,
  QuizCheckResponse,
  BuildValidateRequest,
  BuildValidateResponse,
  BuildCheckRequest,
  BuildCheckResponse,
  ErrorCheckRequest,
  ErrorCheckResponse,
  HintResponse,
} from './types/api.js';

// Chemistry
export {
  VALENCE_TABLE,
  ELEMENT_COLORS,
  ELEMENT_NAMES,
  ELEMENT_TEXT_COLORS,
  PALETTE_ELEMENTS,
  primaryValence,
} from './chemistry/elements.js';

export { validateMolecule } from './chemistry/validation.js';
export { parseFormula, recordToFormula } from './chemistry/formulaParser.js';
export { formulaFromGraph, atomCountsFromGraph } from './chemistry/formulaFromGraph.js';
