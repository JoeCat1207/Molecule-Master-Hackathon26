import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import Card from '../shared/Card';
import Button from '../shared/Button';

export default function QuizMode() {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMolecule = useGameStore((s) => s.currentMolecule);
  const feedbackMessage = useGameStore((s) => s.feedbackMessage);
  const feedbackType = useGameStore((s) => s.feedbackType);
  const hintText = useGameStore((s) => s.hintText);
  const lastScore = useGameStore((s) => s.lastScore);
  const submitQuizAnswer = useGameStore((s) => s.submitQuizAnswer);
  const requestHint = useGameStore((s) => s.requestHint);
  const skipChallenge = useGameStore((s) => s.skipChallenge);
  const loadNextQuizMolecule = useGameStore((s) => s.loadNextQuizMolecule);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentMolecule]);

  if (!currentMolecule) {
    return <div className="flex-1 flex items-center justify-center text-text-dim">Loading molecule...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const correct = await submitQuizAnswer(guess.trim());
    if (correct) {
      setGuess('');
      setTimeout(() => {
        loadNextQuizMolecule();
      }, 2000);
    }
  };

  const handleSkip = () => {
    setGuess('');
    skipChallenge();
  };

  const handleNext = () => {
    setGuess('');
    loadNextQuizMolecule();
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 gap-4 max-w-2xl mx-auto w-full overflow-y-auto">
      {/* Molecule image card */}
      <Card
        className="w-full max-w-sm p-4 shrink-0"
        glow={feedbackType === 'correct' ? 'green' : feedbackType === 'wrong' ? 'red' : null}
      >
        <div className="relative bg-white rounded-xl overflow-hidden flex items-center justify-center" style={{ height: '280px' }}>
          <img
            src={`/api/molecules/${currentMolecule.cid}/image`}
            alt="Molecule structure"
            className="max-w-full max-h-full object-contain p-4"
            draggable={false}
          />
        </div>

        <div className="mt-3 text-center">
          <span className="text-text-dim text-xs font-mono uppercase tracking-wider">
            Level {currentMolecule.level}
          </span>
        </div>
      </Card>

      {/* Feedback */}
      {feedbackMessage && (
        <div
          className={`w-full max-w-md px-4 py-3 rounded-xl text-sm font-medium text-center transition-all ${
            feedbackType === 'correct'
              ? 'bg-good/20 text-good border border-good/30'
              : feedbackType === 'wrong'
                ? 'bg-bad/20 text-bad border border-bad/30'
                : 'bg-gold/20 text-gold border border-gold/30'
          }`}
        >
          {feedbackMessage}
          {lastScore !== 0 && (
            <span className="ml-2 font-bold">
              {lastScore > 0 ? `+${lastScore}` : lastScore}
            </span>
          )}
        </div>
      )}

      {/* Hint */}
      {hintText && (
        <div className="w-full max-w-md px-4 py-3 rounded-xl bg-purple/10 text-purple border border-purple/20 text-sm">
          {hintText}
        </div>
      )}

      {/* Answer input */}
      <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Name this molecule..."
          className="flex-1 px-4 py-3 rounded-xl bg-inset border border-card-border text-text-main placeholder:text-text-dim/50 focus:outline-none focus:ring-2 focus:ring-accent/50 font-medium"
          autoComplete="off"
          autoCorrect="off"
        />
        <Button type="submit" disabled={!guess.trim()}>
          Submit
        </Button>
      </form>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="gold" size="sm" onClick={requestHint}>
          Hint
        </Button>
        <Button variant="danger" size="sm" onClick={handleSkip}>
          Skip
        </Button>
        {feedbackType === 'correct' && (
          <Button variant="primary" size="sm" onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
