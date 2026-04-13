import type { MoleculeData } from '@molecule-master/shared';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function getAiHint(molecule: MoleculeData, wrongAttempts: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getFallbackHint(molecule, wrongAttempts);
  }

  try {
    const resp = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly chemistry tutor helping a student identify a molecule. The molecule has the formula ${molecule.formula}. Give a helpful, educational hint WITHOUT revealing the name. Focus on properties, uses, or structure. Keep it under 3 sentences.`,
          },
          {
            role: 'user',
            content: `I've been trying to name this molecule (${molecule.formula}) but got it wrong ${wrongAttempts} times. Can you give me a hint?`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) return getFallbackHint(molecule, wrongAttempts);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content ?? getFallbackHint(molecule, wrongAttempts);
  } catch {
    return getFallbackHint(molecule, wrongAttempts);
  }
}

function getFallbackHint(molecule: MoleculeData, wrongAttempts: number): string {
  const hints: string[] = [
    `This molecule has the formula ${molecule.formula}.`,
    `The name starts with "${molecule.display[0]}" and has ${molecule.display.length} letters.`,
    `Think about common molecules with this formula in everyday life or biology.`,
  ];

  if (wrongAttempts >= 5) {
    hints.push(`Big hint: The name is "${molecule.display[0]}${'_'.repeat(molecule.display.length - 2)}${molecule.display[molecule.display.length - 1]}".`);
  }

  return hints.slice(0, Math.min(wrongAttempts, hints.length)).join(' ');
}
