import { create } from 'zustand';
import type {
  GamePhase,
  GameMode,
  MoleculeData,
  BuildChallenge,
  ErrorChallenge,
  ChallengeResult,
  MoleculeGraph,
  ValidationResult,
} from '@molecule-master/shared';
import { validateMolecule, CORRECT_PER_LEVEL, MAX_LEVEL, POINTS_PER_LEVEL } from '@molecule-master/shared';
import { api } from '../api/client';

interface GameStore {
  // State
  phase: GamePhase;
  mode: GameMode;
  score: number;
  level: number;
  streak: number;
  correctThisLevel: number;
  wrongAttempts: number;
  isLoading: boolean;

  // Current challenge data
  molecules: MoleculeData[];
  currentMolecule: MoleculeData | null;
  buildChallenges: BuildChallenge[];
  currentBuildChallenge: BuildChallenge | null;
  errorChallenges: ErrorChallenge[];
  currentErrorChallenge: ErrorChallenge | null;

  // Build mode state
  buildGraph: MoleculeGraph;
  validationResult: ValidationResult | null;

  // Error mode state
  flaggedAtomIds: string[];
  flaggedBondIds: string[];

  // Feedback
  hintText: string | null;
  feedbackMessage: string | null;
  feedbackType: 'correct' | 'wrong' | 'partial' | null;
  lastScore: number;

  // Completed tracking
  completedIds: Set<string>;
  history: ChallengeResult[];

  // Actions
  startGame: () => Promise<void>;
  selectMode: (mode: GameMode) => void;
  loadNextQuizMolecule: () => void;
  loadNextBuildChallenge: () => void;
  loadNextErrorChallenge: () => void;
  submitQuizAnswer: (guess: string) => Promise<boolean>;
  requestHint: () => Promise<void>;
  skipChallenge: () => void;
  updateBuildGraph: (graph: MoleculeGraph) => void;
  submitBuild: () => Promise<boolean>;
  toggleFlagAtom: (atomId: string) => void;
  toggleFlagBond: (bondId: string) => void;
  submitErrorFlags: () => Promise<boolean>;
  clearFeedback: () => void;
  goToMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  phase: 'menu',
  mode: 'quiz',
  score: 0,
  level: 1,
  streak: 0,
  correctThisLevel: 0,
  wrongAttempts: 0,
  isLoading: false,
  molecules: [],
  currentMolecule: null,
  buildChallenges: [],
  currentBuildChallenge: null,
  errorChallenges: [],
  currentErrorChallenge: null,
  buildGraph: { atoms: [], bonds: [] },
  validationResult: null,
  flaggedAtomIds: [],
  flaggedBondIds: [],
  hintText: null,
  feedbackMessage: null,
  feedbackType: null,
  lastScore: 0,
  completedIds: new Set(),
  history: [],

  startGame: async () => {
    set({ isLoading: true });
    try {
      const [molecules, buildChallenges, errorChallenges] = await Promise.all([
        api.get<MoleculeData[]>('/molecules'),
        api.get<BuildChallenge[]>('/build/challenges'),
        api.get<ErrorChallenge[]>('/errors/challenges'),
      ]);
      set({
        molecules,
        buildChallenges,
        errorChallenges,
        phase: 'quiz',
        mode: 'quiz',
        isLoading: false,
        score: 0,
        level: 1,
        streak: 0,
        correctThisLevel: 0,
        completedIds: new Set(),
        history: [],
      });
      get().loadNextQuizMolecule();
    } catch (err) {
      console.error('Failed to start game:', err);
      set({ isLoading: false });
    }
  },

  selectMode: (mode) => {
    set({ mode, phase: mode, feedbackMessage: null, feedbackType: null, hintText: null, wrongAttempts: 0 });
    if (mode === 'quiz') get().loadNextQuizMolecule();
    else if (mode === 'build') get().loadNextBuildChallenge();
    else if (mode === 'error') get().loadNextErrorChallenge();
  },

  loadNextQuizMolecule: () => {
    const { molecules, level, completedIds } = get();
    const available = molecules.filter(
      (m) => m.level <= level && !completedIds.has(`quiz-${m.cid}`)
    );
    if (available.length === 0) {
      // Reset completed for this mode if all done
      const quizIds = [...completedIds].filter((id) => id.startsWith('quiz-'));
      const newCompleted = new Set([...completedIds].filter((id) => !id.startsWith('quiz-')));
      set({ completedIds: newCompleted });
      const all = molecules.filter((m) => m.level <= level);
      const random = all[Math.floor(Math.random() * all.length)];
      set({ currentMolecule: random, feedbackMessage: null, feedbackType: null, hintText: null, wrongAttempts: 0 });
      return;
    }
    const random = available[Math.floor(Math.random() * available.length)];
    set({ currentMolecule: random, feedbackMessage: null, feedbackType: null, hintText: null, wrongAttempts: 0 });
  },

  loadNextBuildChallenge: () => {
    const { buildChallenges, level, completedIds } = get();
    const available = buildChallenges.filter(
      (c) => c.level <= level && !completedIds.has(`build-${c.id}`)
    );
    const pool = available.length > 0 ? available : buildChallenges.filter((c) => c.level <= level);
    const random = pool[Math.floor(Math.random() * pool.length)];
    set({
      currentBuildChallenge: random ?? null,
      buildGraph: { atoms: [], bonds: [] },
      validationResult: null,
      feedbackMessage: null,
      feedbackType: null,
      hintText: null,
      wrongAttempts: 0,
    });
  },

  loadNextErrorChallenge: () => {
    const { errorChallenges, level, completedIds } = get();
    const available = errorChallenges.filter(
      (c: any) => c.level <= level && !completedIds.has(`error-${c.id}`)
    );
    const pool = available.length > 0 ? available : errorChallenges.filter((c: any) => c.level <= level);
    const random = pool[Math.floor(Math.random() * pool.length)];
    set({
      currentErrorChallenge: random ?? null,
      flaggedAtomIds: [],
      flaggedBondIds: [],
      feedbackMessage: null,
      feedbackType: null,
    });
  },

  submitQuizAnswer: async (guess) => {
    const { currentMolecule, level, streak, correctThisLevel, score, completedIds } = get();
    if (!currentMolecule) return false;

    try {
      const result = await api.post<{ correct: boolean; score: number; feedback: string; formula?: string }>(
        '/quiz/check',
        { cid: currentMolecule.cid, guess }
      );

      if (result.correct) {
        const earnedScore = level * POINTS_PER_LEVEL + Math.min(streak * 5, 25);
        const newCorrect = correctThisLevel + 1;
        let newLevel = level;
        let newCorrectThisLevel = newCorrect;

        if (newCorrect >= CORRECT_PER_LEVEL && level < MAX_LEVEL) {
          newLevel = level + 1;
          newCorrectThisLevel = 0;
        }

        const newCompleted = new Set(completedIds);
        newCompleted.add(`quiz-${currentMolecule.cid}`);

        set({
          score: score + earnedScore,
          streak: streak + 1,
          level: newLevel,
          correctThisLevel: newCorrectThisLevel,
          completedIds: newCompleted,
          feedbackMessage: result.feedback,
          feedbackType: 'correct',
          lastScore: earnedScore,
        });
        return true;
      } else {
        const wa = get().wrongAttempts + 1;
        const penalty = wa > 3 ? 5 : 0;
        set({
          wrongAttempts: wa,
          streak: 0,
          score: Math.max(0, score - penalty),
          feedbackMessage: result.feedback,
          feedbackType: 'wrong',
          lastScore: -penalty,
        });
        return false;
      }
    } catch (err) {
      console.error('Quiz check failed:', err);
      return false;
    }
  },

  requestHint: async () => {
    const { currentMolecule } = get();
    if (!currentMolecule) return;
    try {
      const result = await api.get<{ hint: string }>(`/molecules/${currentMolecule.cid}/hint`);
      set({ hintText: result.hint });
    } catch (err) {
      set({ hintText: 'Hint unavailable. Try again!' });
    }
  },

  skipChallenge: () => {
    const { mode } = get();
    set({ streak: 0, feedbackMessage: null, feedbackType: null, hintText: null, wrongAttempts: 0 });
    if (mode === 'quiz') get().loadNextQuizMolecule();
    else if (mode === 'build') get().loadNextBuildChallenge();
    else if (mode === 'error') get().loadNextErrorChallenge();
  },

  updateBuildGraph: (graph) => {
    const result = validateMolecule(graph);
    set({ buildGraph: graph, validationResult: result });
  },

  submitBuild: async () => {
    const { currentBuildChallenge, buildGraph, level, streak, score, correctThisLevel, completedIds } = get();
    if (!currentBuildChallenge) return false;

    try {
      const result = await api.post<{
        correct: boolean;
        partialCredit: number;
        feedback: string;
        validation: ValidationResult;
      }>('/build/check', {
        challengeId: currentBuildChallenge.id,
        atoms: buildGraph.atoms,
        bonds: buildGraph.bonds,
      });

      if (result.correct) {
        const earnedScore = level * POINTS_PER_LEVEL * 2;
        const newCorrect = correctThisLevel + 1;
        let newLevel = level;
        let newCorrectThisLevel = newCorrect;

        if (newCorrect >= CORRECT_PER_LEVEL && level < MAX_LEVEL) {
          newLevel = level + 1;
          newCorrectThisLevel = 0;
        }

        const newCompleted = new Set(completedIds);
        newCompleted.add(`build-${currentBuildChallenge.id}`);

        set({
          score: score + earnedScore,
          streak: streak + 1,
          level: newLevel,
          correctThisLevel: newCorrectThisLevel,
          completedIds: newCompleted,
          feedbackMessage: result.feedback,
          feedbackType: 'correct',
          lastScore: earnedScore,
          validationResult: result.validation,
        });
        return true;
      } else {
        const partialScore = Math.floor(result.partialCredit * level * POINTS_PER_LEVEL);
        set({
          wrongAttempts: get().wrongAttempts + 1,
          feedbackMessage: result.feedback,
          feedbackType: result.partialCredit > 0.5 ? 'partial' : 'wrong',
          lastScore: partialScore,
          validationResult: result.validation,
        });
        return false;
      }
    } catch (err) {
      console.error('Build check failed:', err);
      return false;
    }
  },

  toggleFlagAtom: (atomId) => {
    const { flaggedAtomIds } = get();
    if (flaggedAtomIds.includes(atomId)) {
      set({ flaggedAtomIds: flaggedAtomIds.filter((id) => id !== atomId) });
    } else {
      set({ flaggedAtomIds: [...flaggedAtomIds, atomId] });
    }
  },

  toggleFlagBond: (bondId) => {
    const { flaggedBondIds } = get();
    if (flaggedBondIds.includes(bondId)) {
      set({ flaggedBondIds: flaggedBondIds.filter((id) => id !== bondId) });
    } else {
      set({ flaggedBondIds: [...flaggedBondIds, bondId] });
    }
  },

  submitErrorFlags: async () => {
    const { currentErrorChallenge, flaggedAtomIds, flaggedBondIds, level, streak, score, correctThisLevel, completedIds } = get();
    if (!currentErrorChallenge) return false;

    try {
      const result = await api.post<{
        correct: boolean;
        partialCredit: number;
        feedback: string;
        missedErrors: string[];
        falsePositives: string[];
      }>('/errors/check', {
        challengeId: (currentErrorChallenge as any).id,
        flaggedAtomIds,
        flaggedBondIds,
      });

      if (result.correct) {
        const earnedScore = level * POINTS_PER_LEVEL * 1.5;
        const newCorrect = correctThisLevel + 1;
        let newLevel = level;
        let newCorrectThisLevel = newCorrect;

        if (newCorrect >= CORRECT_PER_LEVEL && level < MAX_LEVEL) {
          newLevel = level + 1;
          newCorrectThisLevel = 0;
        }

        const newCompleted = new Set(completedIds);
        newCompleted.add(`error-${(currentErrorChallenge as any).id}`);

        set({
          score: score + Math.floor(earnedScore),
          streak: streak + 1,
          level: newLevel,
          correctThisLevel: newCorrectThisLevel,
          completedIds: newCompleted,
          feedbackMessage: result.feedback,
          feedbackType: 'correct',
          lastScore: Math.floor(earnedScore),
        });
        return true;
      } else {
        set({
          feedbackMessage: result.feedback,
          feedbackType: result.partialCredit > 0.5 ? 'partial' : 'wrong',
          lastScore: 0,
        });
        return false;
      }
    } catch (err) {
      console.error('Error check failed:', err);
      return false;
    }
  },

  clearFeedback: () => set({ feedbackMessage: null, feedbackType: null }),
  goToMenu: () => set({ phase: 'menu' }),
}));
