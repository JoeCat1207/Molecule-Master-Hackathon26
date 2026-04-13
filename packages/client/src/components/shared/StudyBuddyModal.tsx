import { useEffect, useState } from 'react';
import Button from './Button';

interface StudyBuddyModalProps {
  open: boolean;
  onClose: () => void;
  cid: number;
  wrongAttempts: number;
  formula: string;
}

export default function StudyBuddyModal({ open, onClose, cid, wrongAttempts, formula }: StudyBuddyModalProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setHint(null);
      setSource(null);
      return;
    }

    setLoading(true);
    fetch('/api/ai/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid, wrongAttempts }),
    })
      .then((res) => res.json())
      .then((data) => {
        setHint(data.hint);
        setSource(data.source);
      })
      .catch(() => {
        setHint("I couldn't fetch a hint right now. Try using the Hint button for a Wikipedia-based clue!");
        setSource('fallback');
      })
      .finally(() => setLoading(false));
  }, [open, cid, wrongAttempts]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-inset border border-card-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/20 flex items-center justify-center">
              <span className="text-lg">🧪</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">Study Buddy</h3>
              <p className="text-xs text-text-dim">
                {source === 'ai' ? 'AI-powered hint' : 'Here to help!'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {formula && (
            <div className="mb-3 text-xs text-text-dim">
              Formula: <span className="font-mono text-accent font-semibold">{formula}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-text-dim text-sm">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              Thinking...
            </div>
          ) : (
            <p className="text-sm text-text-main leading-relaxed">
              {hint}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-2">
          <span className="text-xs text-text-dim self-center mr-auto">Press Esc to close</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
