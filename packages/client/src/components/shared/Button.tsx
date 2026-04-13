import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-dark text-white',
  secondary: 'bg-card hover:bg-card-border text-text-main border border-card-border',
  danger: 'bg-bad/20 hover:bg-bad/30 text-bad border border-bad/30',
  gold: 'bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30',
  ghost: 'bg-transparent hover:bg-card text-text-dim',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${variants[variant]} ${sizeClasses[size]} rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
