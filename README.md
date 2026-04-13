# Molecule Master

**Build. Learn. Master.** An interactive chemistry learning game with three game modes, real-time molecule validation, and 90 challenges across 5 difficulty levels.

Built with React + TypeScript + Vite (frontend), Node.js + Express (backend), and a custom chemistry validation engine.

---

## Game Modes

### Identify Mode
A molecule's 2D structure is fetched live from **PubChem** and displayed on screen. Type the molecule's name to earn points. Use the **Hint** button for a spoiler-redacted Wikipedia clue, or **Skip** to move on.

### Build Mode
Drag atoms (C, H, O, N, S, P, F, Cl, Br) from a palette onto a **React Flow** canvas and draw bonds between them. The game validates your molecule in real time:
- Valence indicators (e.g. `2/4`) show how many bonds each atom has vs. how many it needs
- Atom rings glow **green** (satisfied), **amber** (incomplete), or **red** (over-bonded)
- A validation panel lists errors and warnings in plain English
- Click any bond to cycle between single, double, and triple

### Debug Mode
A broken molecule is displayed with one or more structural errors (wrong bond order, missing hydrogen, over-bonded atom, etc.). Click atoms and bonds you think are wrong to flag them, then submit. The game tells you what you found, what you missed, and explains the chemistry.

---

## Features

- **90 challenges** across Build, Identify, and Debug modes (30 each), with 6 per level
- **30 real molecules** from water and methane up to chlorophyll, ATP, and quinine
- **5 difficulty levels** with progression (3 correct answers to advance)
- **Real-time chemistry validation** engine with valence checking, connectivity analysis, and formula computation
- **Live PubChem images** — 2D skeletal formulas fetched on demand via a backend proxy
- **Wikipedia hints** with stem-based name redaction (morphological variants like "caffeinated" for "caffeine" are also masked)
- **AI Study Buddy** — optional OpenAI-powered tutoring after 3 wrong attempts (falls back to rule-based hints)
- **Scoring** — points scale with level, streak bonuses, partial credit for Build/Debug modes
- **Dark theme** with glassmorphism cards, animated counters, and a polished UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Flow, Zustand |
| Backend | Node.js, Express, TypeScript |
| Shared | Custom chemistry validation engine (valence rules, formula parsing, graph analysis) |
| APIs | PubChem PUG REST (molecule images), Wikipedia REST (hints), OpenAI Chat Completions (optional tutor) |
| Architecture | npm workspaces monorepo with shared types between client and server |

---

## Project Structure

```
molecule-master/
  packages/
    shared/          # TypeScript types + chemistry validation engine
      src/
        types/       # Atom, Bond, MoleculeGraph, GameSession, API types
        chemistry/   # Valence table, validation, formula parsing
    server/          # Express API
      src/
        routes/      # REST endpoints for quiz, build, error, molecules, AI
        services/    # Business logic, PubChem proxy, Wikipedia hints, sessions
        data/        # 90 challenges as JSON (molecules, build, error)
    client/          # React + Vite frontend
      src/
        components/  # Screens, layout, build canvas, quiz cards, error viewer
        store/       # Zustand game state
        api/         # Fetch wrapper for backend
  molecule_game.py   # Original Python/Tkinter prototype (reference)
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/molecules?level=N` | List molecules (answers stripped) |
| GET | `/api/molecules/:cid/image` | Proxy PubChem PNG |
| GET | `/api/molecules/:cid/hint` | Redacted Wikipedia hint |
| POST | `/api/quiz/check` | Check molecule name guess |
| GET | `/api/build/challenges?level=N` | Build challenge list |
| POST | `/api/build/validate` | Real-time molecule graph validation |
| POST | `/api/build/check` | Check built molecule against target |
| GET | `/api/errors/challenges?level=N` | Error detection challenge list |
| POST | `/api/errors/check` | Check flagged errors |
| POST | `/api/ai/hint` | AI-powered hint (OpenAI with fallback) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

This starts both the Vite frontend (http://localhost:5173) and the Express API (http://localhost:3001). The Vite dev server proxies `/api` requests to the backend automatically.

### Optional: AI Study Buddy

Create a `.env` file in the project root:

```
OPENAI_API_KEY=sk-...
```

If no key is set, the Study Buddy falls back to rule-based hints.

---

## Chemistry Validation Engine

The shared validation engine runs on both client (instant visual feedback) and server (authoritative checks). It supports:

- **Valence checking** for H, C, N, O, S, P, F, Cl, Br, I
- **Connectivity analysis** — detects disconnected atoms and fragments
- **Bond validation** — catches self-loops and duplicate bonds
- **Formula computation** — counts atoms and outputs Hill system formula
- **Partial credit** — scores based on fraction of satisfied atoms

---

## Original Prototype

The original `molecule_game.py` is a single-file Python/Tkinter desktop app with 30 molecules, PubChem images, Wikipedia hints, and OpenAI tutoring. It remains in the repo as a reference.

---

## Attribution

- Chemical structures from [PubChem](https://pubchem.ncbi.nlm.nih.gov/), provided by NCBI at the U.S. National Library of Medicine
- Hint text from Wikipedia contributors, used under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
