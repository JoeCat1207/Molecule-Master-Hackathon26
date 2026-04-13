import { useGameStore } from '../../store/gameStore';
import Header from './Header';
import ModeSelector from './ModeSelector';
import QuizMode from '../screens/QuizMode';
import BuildMode from '../screens/BuildMode';
import ErrorMode from '../screens/ErrorMode';

export default function GameShell() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <ModeSelector />
      <main className="flex-1 flex flex-col min-h-0">
        {phase === 'quiz' && <QuizMode />}
        {phase === 'build' && <BuildMode />}
        {phase === 'error' && <ErrorMode />}
      </main>
    </div>
  );
}
