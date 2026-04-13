import type { MoleculeData } from '@molecule-master/shared';

const WIKI_UA = 'MoleculeMaster/1.0 (educational chemistry practice game)';

/** Fetch a Wikipedia summary and redact the molecule name from it. */
export async function getRedactedHint(molecule: MoleculeData): Promise<string> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(molecule.wiki)}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': WIKI_UA },
    });
    if (!resp.ok) return fallbackHint(molecule);

    const data = await resp.json();
    const extract: string = data.extract ?? '';
    if (!extract) return fallbackHint(molecule);

    // Take first ~2 sentences, capped at 280 chars
    const sentences = extract.split(/(?<=[.!?])\s+/);
    let text = '';
    for (const s of sentences) {
      if ((text + ' ' + s).length > 280) break;
      text = text ? text + ' ' + s : s;
    }
    if (!text) text = extract.slice(0, 280);

    // Build redaction terms
    const redactTerms = buildRedactionTerms(molecule);

    // Apply redaction, longest first
    let redacted = text;
    const sorted = [...redactTerms].sort((a, b) => b.length - a.length);
    for (const term of sorted) {
      const pattern = buildRedactionPattern(term);
      redacted = redacted.replace(pattern, '\u2588\u2588\u2588');
    }

    return `Hint (formula ${molecule.formula}): ${redacted}`;
  } catch {
    return fallbackHint(molecule);
  }
}

function buildRedactionTerms(molecule: MoleculeData): Set<string> {
  const terms = new Set<string>();

  // Add all accepted answers
  for (const answer of molecule.answers) {
    terms.add(answer.toLowerCase());
  }

  // Add display name and its words > 3 letters
  terms.add(molecule.display.toLowerCase());
  for (const word of molecule.display.split(/\s+/)) {
    if (word.length > 3) terms.add(word.toLowerCase());
  }

  // Add wiki title words > 3 letters
  for (const word of molecule.wiki.replace(/_/g, ' ').split(/\s+/)) {
    if (word.length > 3) terms.add(word.toLowerCase());
  }

  return terms;
}

function buildRedactionPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // For alpha terms of 5+ letters, use stem-based matching
  if (/^[a-z]+$/i.test(term) && term.length >= 5) {
    const stem = escaped.slice(0, -2); // drop last 2 chars for stem
    return new RegExp(stem + '[a-z]*', 'gi');
  }
  // For shorter or non-alpha terms, exact word-boundary match
  return new RegExp(`\\b${escaped}\\b`, 'gi');
}

function fallbackHint(molecule: MoleculeData): string {
  const name = molecule.display;
  const firstLetter = name[0].toUpperCase();
  return `Hint (formula ${molecule.formula}): This molecule starts with "${firstLetter}" and has ${name.length} letters.`;
}
