# Molecule Master

A chemistry practice game built in Python. A 2D molecular structure is shown
on screen and the player has to name it. Points and difficulty increase as the
player progresses — the game pulls structures live from **PubChem** and
fetches spoiler-redacted hints from **Wikipedia**.

![level-up demo](./Screenshot%202026-04-13%20at%208.46.02%20AM.png)

---

## Features

- **30 molecules across 5 difficulty levels**, from water and methane up to
  chlorophyll a, ATP, and quinine.
- **Live structure images** — 2D skeletal formulas are fetched on demand from
  the PubChem PUG REST API (`/compound/cid/{cid}/PNG`). Images are
  auto-cropped to remove PubChem's whitespace padding, scaled to fit while
  preserving aspect ratio (downscale-only, never upscaled into blur), and
  dropped onto a rounded white plate so bonds stay crisp against the dark
  theme.
- **Secondary API for hints** — the *HINT* button hits the Wikipedia REST
  summary endpoint (`/api/rest_v1/page/summary/{title}`), trims the result to
  a couple of sentences, and redacts the molecule's name, synonyms, **and
  morphological variants** (e.g. "adrenalin" when the answer is
  "adrenaline", "caffeinated" when the answer is "caffeine") with █-blocks
  before showing it.
- **Dynamic scoring** — each correct answer is worth `level × 10` points.
  Three correct answers in a row at a level advance the player to the next
  level (up to level 5). After **more than 3 wrong attempts** on the same
  molecule, every additional wrong guess deducts **5 points** (score is
  clamped at 0).
- **AI Study Buddy** — if the player gets the same molecule wrong 3 times,
  a polished popup tutor powered by the **OpenAI Chat Completions API**
  (`gpt-4o-mini`) appears with a friendly, spoiler-free hint tailored to
  that molecule. The panel uses a dedicated reading-friendly typography
  pair (Avenir Next for headings, Georgia 16 pt for body), shows the
  molecule's formula as context, supports **Esc** to close, and has a
  visible "Got it" dismiss button. It auto-dismisses as soon as the
  student answers correctly (or skips).
- **Streak counter** that resets on wrong answers and skips.
- **Flexible answer matching** — case-insensitive, multiple *name-based*
  synonyms per molecule (e.g. `acetaminophen` / `paracetamol` / `tylenol`,
  `adrenaline` / `epinephrine`, `ethanol` / `ethyl alcohol`). Chemical
  formulas are intentionally **not** accepted as answers, because the hint
  system reveals the formula — accepting it would let players auto-solve.
- **Visually polished UI** built entirely on a Tkinter `Canvas`:
  - Vertical slate gradient background (96-step color interpolation) —
    neutral rather than navy so the app reads less "blue".
  - Rounded-corner cards with soft drop-shadows and teal accent borders.
  - Card flashes emerald / red on correct / wrong answers.
  - Animated progress bar toward the next level.
  - Stat panel showing SCORE (gold), LEVEL (teal), and STREAK (emerald).
  - Canvas-drawn action buttons with distinct semantic colors — SUBMIT
    emerald, HINT amber, SKIP red — and hover states, so the dark theme
    renders consistently on macOS, Windows, and Linux (bypassing platform
    button styling quirks).
- **Non-blocking networking** — image downloads and Wikipedia lookups run on
  background threads, so the UI never freezes. Both responses are cached.

---

## APIs used

| API | Purpose | Endpoint |
| --- | --- | --- |
| **PubChem PUG REST** (primary) | Fetch 2D structure PNGs by compound ID | `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG?image_size=large` |
| **Wikipedia REST v1** (secondary, for hints) | Fetch short article summaries | `https://en.wikipedia.org/api/rest_v1/page/summary/{title}` |
| **OpenAI Chat Completions** (tutor assistant) | Generate spoiler-free help when a student struggles | `https://api.openai.com/v1/chat/completions` (model `gpt-4o-mini`) |

PubChem and Wikipedia require no API key. Wikipedia is called with a
descriptive `User-Agent` header per their
[API etiquette](https://en.wikipedia.org/api/rest_v1/).

The OpenAI endpoint requires a Bearer API key, which the game reads from
the `OPENAI_API_KEY` environment variable. For convenience, a `.env` file
placed next to `molecule_game.py` is auto-loaded at startup:

```bash
cp .env.example .env
# then edit .env and paste your key
echo 'OPENAI_API_KEY=sk-...' > .env
```

`.env` is listed in `.gitignore`, so your key is never committed. If no
key is set, the Study Buddy popup still appears after 3 wrong attempts
but shows a fallback hint instead of calling OpenAI.

---

## Installation

Requires Python 3.9+.

```bash
pip install requests Pillow
```

`tkinter` ships with the Python standard library. On macOS and Windows it
comes preinstalled; on most Linux distributions install it via the system
package manager (`sudo apt install python3-tk` on Debian/Ubuntu).

---

## Running the game

From the project folder:

```bash
python3 molecule_game.py
```

A 980 × 780 window will open. Type your answer in the text box and press
**Enter** (or click **SUBMIT**). Use **HINT** for a spoiler-redacted clue
from Wikipedia, or **SKIP** to give up and move on.

---

## How to play

1. A molecule is loaded from PubChem and shown on the card.
2. Type its common name in the text field and press **Enter**.
3. If you're right, you earn `level × 10` points and your streak goes up.
4. Every 3 correct answers at the current level bumps you up one level, up
   to level 5 (where each correct answer is worth 50 points).
5. A wrong answer resets the streak and reveals the molecular formula as a
   consolation clue. Click **HINT** if you want a description-based clue
   from Wikipedia instead. (Because the formula is shown in these clues,
   formulas are not accepted as valid answers — you have to know the
   name.)
6. After **3 wrong attempts** on the same molecule, the **Study Buddy**
   popup opens with an OpenAI-generated hint. After **more than 3 wrong
   attempts**, each further wrong guess costs you 5 points.

### Accepted answers

The game accepts any of several common names or formulas per molecule. A few
examples:

| Display name | Also accepted |
| --- | --- |
| Water | `water`, `dihydrogen monoxide` |
| Acetone | `acetone`, `propanone`, `2-propanone`, `dimethyl ketone` |
| Acetaminophen | `acetaminophen`, `paracetamol`, `tylenol` |
| Adrenaline | `adrenaline`, `epinephrine` |
| Ascorbic acid | `ascorbic acid`, `vitamin c`, `l-ascorbic acid` |

Matching is case-insensitive and whitespace-tolerant. Molecular formulas
are not accepted, since the hint system reveals the formula.

---

## Difficulty levels

| Level | Points / correct | Example molecules |
| --- | --- | --- |
| 1 | 10 | Water, methane, ammonia, carbon dioxide, nitrogen, hydrogen peroxide |
| 2 | 20 | Ethanol, methanol, acetic acid, benzene, ethylene, propane |
| 3 | 30 | Caffeine, aspirin, acetone, urea, glucose, citric acid |
| 4 | 40 | Cholesterol, testosterone, dopamine, serotonin, adrenaline, acetaminophen |
| 5 | 50 | Penicillin G, ATP, vitamin C, quinine, chlorophyll a, quercetin |

---

## Project structure

```
Chemistry Project/
├── molecule_game.py   # the entire game (single file)
└── README.md          # this file
```

Everything — game logic, API calls, image processing, and the full
Tkinter/Canvas UI — lives in `molecule_game.py`.

---

## How the hint redaction works

When the player clicks **HINT**, the game:

1. Fetches the Wikipedia summary for the molecule's page title.
2. Splits the extract on sentence boundaries and takes the first ~2 sentences
   (trimmed to 280 characters).
3. Builds a redaction set containing: all accepted answers, the molecule's
   display name, every word >3 letters in the display name, and every word
   >3 letters in the Wikipedia title.
4. Replaces each redaction term with `███`, longest terms first. For alpha
   terms of 5+ letters, matching is stem-based (drop the last 1–2
   characters, then match the stem plus any alphabetical suffix) so that
   morphological variants like "adrenalin" for "adrenaline",
   "caffeinated" for "caffeine", or "acetates" for "acetate" are also
   masked. Short or non-alpha terms (e.g. `atp`, `5-ht`) use exact
   word-boundary matching so they don't over-redact.

So a hint for caffeine looks like:

> **Hint (formula C₈H₁₀N₄O₂):**  ███ is a central nervous system (CNS)
> stimulant of the methylxanthine class and is the most commonly consumed
> psychoactive substance globally…

If the Wikipedia call fails for any reason, the hint falls back to a generic
*"starts with X, N letters"* clue built from the molecule's display name.

---

## Attribution

- Chemical structures © [PubChem](https://pubchem.ncbi.nlm.nih.gov/), a free
  resource provided by the National Center for Biotechnology Information
  (NCBI) at the U.S. National Library of Medicine.
- Descriptive hint text © Wikipedia contributors, used under
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
