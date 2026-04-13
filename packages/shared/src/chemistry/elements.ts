/** Allowed valences per element. Most elements have one primary valence. */
export const VALENCE_TABLE: Record<string, number[]> = {
  H:  [1],
  C:  [4],
  N:  [3, 5],
  O:  [2],
  S:  [2, 4, 6],
  P:  [3, 5],
  F:  [1],
  Cl: [1],
  Br: [1],
  I:  [1],
};

/** CPK-style element colors for atom nodes. */
export const ELEMENT_COLORS: Record<string, string> = {
  H:  '#f0f0f0',
  C:  '#404040',
  N:  '#3b82f6',
  O:  '#ef4444',
  S:  '#eab308',
  P:  '#f97316',
  F:  '#22c55e',
  Cl: '#22c55e',
  Br: '#a3350a',
  I:  '#7c3aed',
};

/** Full element names. */
export const ELEMENT_NAMES: Record<string, string> = {
  H: 'Hydrogen',
  C: 'Carbon',
  N: 'Nitrogen',
  O: 'Oxygen',
  S: 'Sulfur',
  P: 'Phosphorus',
  F: 'Fluorine',
  Cl: 'Chlorine',
  Br: 'Bromine',
  I: 'Iodine',
};

/** Text color for element labels (dark text on light elements, light text on dark). */
export const ELEMENT_TEXT_COLORS: Record<string, string> = {
  H:  '#1a1a1a',
  C:  '#ffffff',
  N:  '#ffffff',
  O:  '#ffffff',
  S:  '#1a1a1a',
  P:  '#ffffff',
  F:  '#ffffff',
  Cl: '#ffffff',
  Br: '#ffffff',
  I:  '#ffffff',
};

/** Elements available in the builder palette, in order. */
export const PALETTE_ELEMENTS = ['C', 'H', 'O', 'N', 'S', 'P', 'F', 'Cl', 'Br'] as const;

/** Get the primary (most common) valence for an element. */
export function primaryValence(element: string): number {
  return VALENCE_TABLE[element]?.[0] ?? 0;
}
