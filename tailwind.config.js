/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffaf6',
          100: '#fdf3ea',
          200: '#fae7d6',
          300: '#f5d4ba',
        },
        rose: {
          50: '#fff5f8',
          100: '#ffe9f1',
          200: '#ffd4e3',
          300: '#ffb6cf',
          400: '#ff8fb5',
          500: '#fb6a98',
          600: '#e84d7d',
          700: '#c63864',
          800: '#a32a52',
          900: '#8a2347',
        },
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
        sage: {
          100: '#e8f0e4',
          200: '#cfe0c8',
          300: '#a8c79b',
          400: '#84ab74',
          500: '#649158',
        },
        ink: {
          900: '#3d2b32',
          700: '#5a4452',
          500: '#7a6470',
          400: '#9a8390',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(196, 120, 150, 0.25)',
        fluffy: '0 18px 40px -16px rgba(196, 120, 150, 0.35)',
        innersoft: 'inset 0 2px 8px -2px rgba(196, 120, 150, 0.18)',
      },
      backgroundImage: {
        'yarn-dots': 'radial-gradient(circle at 20% 20%, rgba(255,182,207,0.35) 0 2px, transparent 3px), radial-gradient(circle at 80% 60%, rgba(216,180,254,0.30) 0 2px, transparent 3px)',
      },
      keyframes: {
        'float-soft': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'heart-beat': {
          '0%,100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.25)' },
          '60%': { transform: 'scale(0.95)' },
        },
      },
      animation: {
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'pop-in': 'pop-in 0.3s ease-out',
        'heart-beat': 'heart-beat 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
