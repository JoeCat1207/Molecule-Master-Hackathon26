import { useGameStore } from '../../store/gameStore';
import Button from '../shared/Button';

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const isLoading = useGameStore((s) => s.isLoading);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Decorative atoms */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-3 h-3 rounded-full bg-accent/20 animate-pulse" />
        <div className="absolute top-40 right-32 w-2 h-2 rounded-full bg-good/20 animate-pulse delay-300" />
        <div className="absolute bottom-32 left-40 w-4 h-4 rounded-full bg-purple/20 animate-pulse delay-500" />
        <div className="absolute top-60 left-1/3 w-2 h-2 rounded-full bg-gold/20 animate-pulse delay-700" />
        <div className="absolute bottom-48 right-1/4 w-3 h-3 rounded-full bg-bad/10 animate-pulse delay-200" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-good/20 border border-good/30 flex items-center justify-center">
            <span className="text-3xl">⚗</span>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold text-text-main tracking-tight">
            Molecule Master
          </h1>
          <p className="mt-2 text-lg text-text-dim">
            Build. Learn. Master.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-left bg-card/60 backdrop-blur-xl border border-card-border rounded-2xl p-6 w-full">
          <Feature icon="?" label="Identify" desc="Name molecules from their 2D structures" />
          <Feature icon="+" label="Build" desc="Construct molecules atom by atom with real-time validation" />
          <Feature icon="!" label="Debug" desc="Find errors in broken molecular structures" />
        </div>

        <Button
          size="lg"
          onClick={startGame}
          disabled={isLoading}
          className="w-full max-w-xs text-lg"
        >
          {isLoading ? 'Loading...' : 'Start Playing'}
        </Button>

        <p className="text-xs text-text-dim">
          Powered by PubChem + Wikipedia + AI
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-text-main text-sm">{label}</div>
        <div className="text-text-dim text-xs">{desc}</div>
      </div>
    </div>
  );
}
