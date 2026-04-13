import { useGameStore } from '../../store/gameStore';
import type { GameMode } from '@molecule-master/shared';

const modes: { id: GameMode; label: string; icon: string; minLevel: number }[] = [
  { id: 'quiz', label: 'Identify', icon: '?', minLevel: 1 },
  { id: 'build', label: 'Build', icon: '+', minLevel: 1 },
  { id: 'error', label: 'Debug', icon: '!', minLevel: 1 },
];

export default function ModeSelector() {
  const mode = useGameStore((s) => s.mode);
  const level = useGameStore((s) => s.level);
  const selectMode = useGameStore((s) => s.selectMode);

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {modes.map((m) => {
        const locked = level < m.minLevel;
        const active = mode === m.id;

        return (
          <button
            key={m.id}
            onClick={() => !locked && selectMode(m.id)}
            disabled={locked}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${active
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : locked
                  ? 'bg-card/50 text-text-dim/40 cursor-not-allowed'
                  : 'bg-card hover:bg-card-border text-text-dim hover:text-text-main'
              }
            `}
          >
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
              active ? 'bg-white/20' : 'bg-card-border'
            }`}>
              {locked ? '🔒' : m.icon}
            </span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
