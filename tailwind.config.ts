import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14181c',
          muted: '#5c6672',
          soft: '#8a94a1',
        },
        emerald: {
          50: '#f0f7f3',
          100: '#d9ebe1',
          200: '#b3d7c4',
          300: '#82bb9f',
          400: '#4e9a77',
          500: '#2f7d5b',
          600: '#1f6248',
          700: '#194e3a',
          800: '#143c2d',
          900: '#0f2c21',
        },
        gold: {
          50: '#fdf9ef',
          100: '#f8eed4',
          200: '#f0dca6',
          300: '#e4c26d',
          400: '#d4a844',
          500: '#b98c2c',
          600: '#956d21',
        },
        canvas: '#f7f8f7',
        line: '#e4e8e6',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,24,28,0.04), 0 8px 24px -12px rgba(20,24,28,0.12)',
        lift: '0 2px 4px rgba(20,24,28,0.05), 0 18px 40px -16px rgba(20,24,28,0.22)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'fade-up': 'fade-up .45s cubic-bezier(.2,.8,.2,1) both',
        'fade-in': 'fade-in .3s ease both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
