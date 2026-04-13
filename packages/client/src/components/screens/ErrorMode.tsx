import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { ELEMENT_COLORS, ELEMENT_TEXT_COLORS } from '@molecule-master/shared';

export default function ErrorMode() {
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentErrorChallenge = useGameStore((s) => s.currentErrorChallenge) as any;
  const flaggedAtomIds = useGameStore((s) => s.flaggedAtomIds);
  const flaggedBondIds = useGameStore((s) => s.flaggedBondIds);
  const feedbackMessage = useGameStore((s) => s.feedbackMessage);
  const feedbackType = useGameStore((s) => s.feedbackType);
  const toggleFlagAtom = useGameStore((s) => s.toggleFlagAtom);
  const toggleFlagBond = useGameStore((s) => s.toggleFlagBond);
  const submitErrorFlags = useGameStore((s) => s.submitErrorFlags);
  const skipChallenge = useGameStore((s) => s.skipChallenge);
  const loadNextErrorChallenge = useGameStore((s) => s.loadNextErrorChallenge);

  if (!currentErrorChallenge) {
    return <div className="flex-1 flex items-center justify-center text-text-dim">Loading challenge...</div>;
  }

  const { atoms, bonds, moleculeName, description } = currentErrorChallenge;

  // Calculate SVG viewBox from atom positions
  const padding = 80;
  const minX = Math.min(...atoms.map((a: any) => a.x)) - padding;
  const maxX = Math.max(...atoms.map((a: any) => a.x)) + padding;
  const minY = Math.min(...atoms.map((a: any) => a.y)) - padding;
  const maxY = Math.max(...atoms.map((a: any) => a.y)) + padding;

  const handleSubmit = async () => {
    const correct = await submitErrorFlags();
    setHasChecked(true);
    setIsCorrect(correct);
  };

  const handleNext = () => {
    setHasChecked(false);
    setIsCorrect(false);
    loadNextErrorChallenge();
  };

  const handleSkip = () => {
    setHasChecked(false);
    setIsCorrect(false);
    skipChallenge();
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 gap-6 max-w-3xl mx-auto w-full overflow-y-auto">
      {/* Challenge info */}
      <Card className="w-full px-6 py-4">
        <div className="text-xs text-text-dim uppercase tracking-wider">Debug Mode</div>
        <div className="text-lg font-bold text-text-main mt-1">{moleculeName}</div>
        <div className="text-sm text-text-dim mt-1">{description}</div>
        <div className="text-xs text-accent mt-2">Click atoms or bonds you think are wrong, then submit.</div>
      </Card>

      {/* Feedback */}
      {feedbackMessage && (
        <div
          className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-center ${
            feedbackType === 'correct'
              ? 'bg-good/20 text-good border border-good/30'
              : feedbackType === 'partial'
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-bad/20 text-bad border border-bad/30'
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Molecule SVG viewer */}
      <Card className="w-full p-4">
        <svg
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          className="w-full"
          style={{ maxHeight: '350px' }}
        >
          {/* Bonds */}
          {bonds.map((bond: any) => {
            const source = atoms.find((a: any) => a.id === bond.source);
            const target = atoms.find((a: any) => a.id === bond.target);
            if (!source || !target) return null;
            const isFlagged = flaggedBondIds.includes(bond.id);

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len * 4;
            const ny = dx / len * 4;

            return (
              <g
                key={bond.id}
                onClick={() => toggleFlagBond(bond.id)}
                className="cursor-pointer"
              >
                {bond.order === 1 && (
                  <line
                    x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                    stroke={isFlagged ? '#f87171' : '#8a92a6'}
                    strokeWidth={isFlagged ? 5 : 3}
                  />
                )}
                {bond.order === 2 && (
                  <>
                    <line
                      x1={source.x + nx} y1={source.y + ny} x2={target.x + nx} y2={target.y + ny}
                      stroke={isFlagged ? '#f87171' : '#8a92a6'} strokeWidth={isFlagged ? 5 : 3}
                    />
                    <line
                      x1={source.x - nx} y1={source.y - ny} x2={target.x - nx} y2={target.y - ny}
                      stroke={isFlagged ? '#f87171' : '#8a92a6'} strokeWidth={isFlagged ? 5 : 3}
                    />
                  </>
                )}
                {bond.order === 3 && (
                  <>
                    <line x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                      stroke={isFlagged ? '#f87171' : '#8a92a6'} strokeWidth={isFlagged ? 5 : 3} />
                    <line x1={source.x + nx * 1.5} y1={source.y + ny * 1.5} x2={target.x + nx * 1.5} y2={target.y + ny * 1.5}
                      stroke={isFlagged ? '#f87171' : '#8a92a6'} strokeWidth={isFlagged ? 5 : 3} />
                    <line x1={source.x - nx * 1.5} y1={source.y - ny * 1.5} x2={target.x - nx * 1.5} y2={target.y - ny * 1.5}
                      stroke={isFlagged ? '#f87171' : '#8a92a6'} strokeWidth={isFlagged ? 5 : 3} />
                  </>
                )}
                {/* Invisible wider click target */}
                <line
                  x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                  stroke="transparent" strokeWidth={20}
                />
              </g>
            );
          })}

          {/* Atoms */}
          {atoms.map((atom: any) => {
            const isFlagged = flaggedAtomIds.includes(atom.id);
            const bgColor = ELEMENT_COLORS[atom.element] ?? '#888';
            const textColor = ELEMENT_TEXT_COLORS[atom.element] ?? '#fff';

            return (
              <g
                key={atom.id}
                onClick={() => toggleFlagAtom(atom.id)}
                className="cursor-pointer"
              >
                {/* Flag ring */}
                {isFlagged && (
                  <circle cx={atom.x} cy={atom.y} r={28} fill="none" stroke="#f87171" strokeWidth={4} />
                )}
                <circle cx={atom.x} cy={atom.y} r={22} fill={bgColor} stroke={isFlagged ? '#f87171' : '#343c52'} strokeWidth={2} />
                <text
                  x={atom.x} y={atom.y} textAnchor="middle" dominantBaseline="central"
                  fill={textColor} fontWeight="bold" fontSize="14"
                >
                  {atom.element}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>

      {/* Selection summary + actions */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-text-dim">
          Flagged: <span className="text-bad font-bold">{flaggedAtomIds.length + flaggedBondIds.length}</span> items
        </div>
        {isCorrect ? (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        ) : hasChecked ? (
          <Button onClick={handleSubmit}>
            Resubmit
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={flaggedAtomIds.length + flaggedBondIds.length === 0}>
            Check
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={handleSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
