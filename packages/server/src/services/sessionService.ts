import type { GameSession } from '@molecule-master/shared';
import { CORRECT_PER_LEVEL } from '@molecule-master/shared';

const sessions = new Map<string, GameSession>();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createSession(): GameSession {
  const session: GameSession = {
    id: generateId(),
    score: 0,
    level: 1,
    streak: 0,
    xp: 0,
    xpToNextLevel: CORRECT_PER_LEVEL,
    correctThisLevel: 0,
    completedChallenges: [],
    history: [],
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<GameSession>): GameSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  Object.assign(session, updates);
  return session;
}
