import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { top: '#151a24', bottom: '#232a3a' },
        card: { DEFAULT: '#1c2230', border: '#343c52' },
        inset: '#12161f',
        accent: { DEFAULT: '#14b8a6', dark: '#0d9488' },
        good: '#34d399',
        bad: '#f87171',
        gold: '#f5b841',
        purple: '#a78bfa',
        'text-main': '#e8ecf2',
        'text-dim': '#8a92a6',
        'bar-track': '#2a3144',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
