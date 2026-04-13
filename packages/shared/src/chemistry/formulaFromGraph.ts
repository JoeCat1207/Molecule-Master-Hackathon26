import type { MoleculeGraph } from '../types/chemistry.js';
import { recordToFormula } from './formulaParser.js';

/** Count atoms in a molecule graph and return a formula string (Hill system). */
export function formulaFromGraph(graph: MoleculeGraph): string {
  const counts: Record<string, number> = {};
  for (const atom of graph.atoms) {
    counts[atom.element] = (counts[atom.element] ?? 0) + 1;
  }
  return recordToFormula(counts);
}

/** Get atom counts from a graph as a record. */
export function atomCountsFromGraph(graph: MoleculeGraph): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const atom of graph.atoms) {
    counts[atom.element] = (counts[atom.element] ?? 0) + 1;
  }
  return counts;
}
