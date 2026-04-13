import type {
  MoleculeGraph,
  Atom,
  AtomStatus,
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from '../types/chemistry.js';
import { VALENCE_TABLE } from './elements.js';
import { formulaFromGraph } from './formulaFromGraph.js';

/** Count total bond order for a given atom. */
function countBonds(atomId: string, graph: MoleculeGraph): number {
  let total = 0;
  for (const bond of graph.bonds) {
    if (bond.source === atomId || bond.target === atomId) {
      total += bond.order;
    }
  }
  return total;
}

/** Check if a bond count is valid for an element. */
function isValidValence(element: string, bondCount: number): boolean {
  const allowed = VALENCE_TABLE[element];
  if (!allowed) return true; // unknown element, assume valid
  return allowed.includes(bondCount);
}

/** Check if a bond count exceeds the max valence for an element. */
function isOverBonded(element: string, bondCount: number): boolean {
  const allowed = VALENCE_TABLE[element];
  if (!allowed) return false;
  return bondCount > Math.max(...allowed);
}

/** Find connected components using BFS. Returns number of components. */
function countComponents(graph: MoleculeGraph): number {
  if (graph.atoms.length === 0) return 0;

  const visited = new Set<string>();
  const adjacency = new Map<string, string[]>();

  for (const atom of graph.atoms) {
    adjacency.set(atom.id, []);
  }
  for (const bond of graph.bonds) {
    adjacency.get(bond.source)?.push(bond.target);
    adjacency.get(bond.target)?.push(bond.source);
  }

  let components = 0;
  for (const atom of graph.atoms) {
    if (visited.has(atom.id)) continue;
    components++;
    const queue = [atom.id];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return components;
}

/** Validate a molecule graph. Returns detailed validation result. */
export function validateMolecule(graph: MoleculeGraph): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const atomStatuses: Record<string, AtomStatus> = {};

  // Check each atom's valence
  for (const atom of graph.atoms) {
    const bondCount = countBonds(atom.id, graph);
    const required = VALENCE_TABLE[atom.element]?.[0] ?? 0;
    const satisfied = isValidValence(atom.element, bondCount);
    const overBonded = isOverBonded(atom.element, bondCount);

    atomStatuses[atom.id] = {
      element: atom.element,
      currentBonds: bondCount,
      requiredBonds: required,
      satisfied,
      overBonded,
    };

    if (overBonded) {
      errors.push({
        type: 'valence_violation',
        atomId: atom.id,
        message: `${atom.element} has ${bondCount} bond${bondCount !== 1 ? 's' : ''} but its maximum is ${Math.max(...(VALENCE_TABLE[atom.element] ?? [0]))}`,
      });
    } else if (!satisfied && bondCount > 0) {
      warnings.push({
        type: 'incomplete_valence',
        atomId: atom.id,
        message: `${atom.element} has ${bondCount} bond${bondCount !== 1 ? 's' : ''} but needs ${required}`,
      });
    }
  }

  // Check for self-loops
  for (const bond of graph.bonds) {
    if (bond.source === bond.target) {
      errors.push({
        type: 'self_loop',
        bondId: bond.id,
        message: 'An atom cannot bond to itself',
      });
    }
  }

  // Check for duplicate bonds
  const bondPairs = new Set<string>();
  for (const bond of graph.bonds) {
    const key = [bond.source, bond.target].sort().join('-');
    if (bondPairs.has(key)) {
      errors.push({
        type: 'duplicate_bond',
        bondId: bond.id,
        message: 'Duplicate bond between the same atoms (use double/triple bond instead)',
      });
    }
    bondPairs.add(key);
  }

  // Check connectivity
  if (graph.atoms.length > 1) {
    const components = countComponents(graph);
    if (components > 1) {
      errors.push({
        type: 'disconnected_atom',
        message: `Molecule has ${components} disconnected parts — all atoms must be connected`,
      });
    }
  }

  // Check for disconnected atoms (no bonds at all)
  for (const atom of graph.atoms) {
    if (graph.atoms.length > 1 && countBonds(atom.id, graph) === 0) {
      warnings.push({
        type: 'incomplete_valence',
        atomId: atom.id,
        message: `${atom.element} has no bonds`,
      });
    }
  }

  const allSatisfied = Object.values(atomStatuses).every((s) => s.satisfied);
  const formula = formulaFromGraph(graph);

  return {
    valid: errors.length === 0,
    complete: errors.length === 0 && allSatisfied,
    errors,
    warnings,
    atomStatuses,
    formula,
  };
}
