import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'green' | 'red' | 'gold' | null;
}

export default function Card({ children, className = '', glow }: CardProps) {
  const glowClasses = {
    green: 'ring-2 ring-good/50 shadow-good/20 shadow-lg',
    red: 'ring-2 ring-bad/50 shadow-bad/20 shadow-lg',
    gold: 'ring-2 ring-gold/50 shadow-gold/20 shadow-lg',
  };

  return (
    <div
      className={`bg-card/80 backdrop-blur-xl border border-card-border rounded-2xl shadow-2xl transition-all duration-300 ${glow ? glowClasses[glow] : ''} ${className}`}
    >
      {children}
    </div>
  );
}
