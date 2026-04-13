export interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  charge?: number;
}

export interface Bond {
  id: string;
  source: string;
  target: string;
  order: 1 | 2 | 3;
}

export interface MoleculeGraph {
  atoms: Atom[];
  bonds: Bond[];
}

export interface AtomStatus {
  element: string;
  currentBonds: number;
  requiredBonds: number;
  satisfied: boolean;
  overBonded: boolean;
}

export interface ValidationError {
  type: 'valence_violation' | 'disconnected_atom' | 'self_loop' | 'duplicate_bond';
  atomId?: string;
  bondId?: string;
  message: string;
}

export interface ValidationWarning {
  type: 'incomplete_valence' | 'unusual_bond';
  atomId?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  complete: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  atomStatuses: Record<string, AtomStatus>;
  formula: string;
}
