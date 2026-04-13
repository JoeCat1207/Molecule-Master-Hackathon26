import { useGameStore } from './store/gameStore';
import StartScreen from './components/screens/StartScreen';
import GameShell from './components/layout/GameShell';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  if (phase === 'menu') {
    return <StartScreen />;
  }

  return <GameShell />;
}
