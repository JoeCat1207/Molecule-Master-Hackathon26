import { useGameStore } from '../../store/gameStore';

export default function Header() {
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const streak = useGameStore((s) => s.streak);
  const correctThisLevel = useGameStore((s) => s.correctThisLevel);
  const goToMenu = useGameStore((s) => s.goToMenu);

  const progressPercent = (correctThisLevel / 3) * 100;

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-card-border bg-card/50 backdrop-blur-xl">
      <button onClick={goToMenu} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-text-main hidden sm:block">Molecule Master</span>
      </button>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gold font-mono font-bold text-lg">{score}</span>
          <span className="text-text-dim text-xs uppercase tracking-wider">Score</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-accent font-mono font-bold text-lg">{level}</span>
          <span className="text-text-dim text-xs uppercase tracking-wider">Level</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-good font-mono font-bold text-lg">{streak}</span>
          <span className="text-text-dim text-xs uppercase tracking-wider">Streak</span>
        </div>

        {/* XP Progress bar */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-24 h-2 bg-bar-track rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-text-dim text-xs">{correctThisLevel}/3</span>
        </div>
      </div>
    </header>
  );
}
