/**
 * Parse a molecular formula like "C2H6O" into a record { C: 2, H: 6, O: 1 }.
 * Handles subscript unicode characters (e.g. "C₂H₆O").
 */
export function parseFormula(formula: string): Record<string, number> {
  // Replace unicode subscripts with ASCII digits
  const normalized = formula
    .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
    .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
    .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8')
    .replace(/₉/g, '9');

  const result: Record<string, number> = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    if (!match[1]) continue;
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    result[element] = (result[element] ?? 0) + count;
  }

  return result;
}

/** Convert a record { C: 2, H: 6, O: 1 } into "C2H6O". Hill system order. */
export function recordToFormula(record: Record<string, number>): string {
  // Hill system: C first, H second, then alphabetical
  const elements = Object.keys(record).sort((a, b) => {
    if (a === 'C') return -1;
    if (b === 'C') return 1;
    if (a === 'H') return -1;
    if (b === 'H') return 1;
    return a.localeCompare(b);
  });

  return elements
    .filter((el) => record[el] > 0)
    .map((el) => (record[el] === 1 ? el : `${el}${record[el]}`))
    .join('');
}
