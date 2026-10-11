/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        surface2: token('surface2'),
        line: token('line'),
        ink: token('ink'),
        mute: token('mute'),
        accent: token('accent'),
        'accent-fg': token('accent-fg'),
        ok: token('ok'),
        warn: token('warn'),
        bad: token('bad'),
        info: token('info'),
        side: token('side'),
        'side-ink': token('side-ink'),
        'side-mute': token('side-mute'),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Noto Serif Thai"', 'serif'],
        serif: ['"Noto Serif Thai"', 'serif'],
      },
      borderRadius: {
        xl: 'var(--radius-sm)',
        '2xl': 'var(--radius)',
        '3xl': 'calc(var(--radius) + 8px)',
      },
      screens: { xs: '420px' },
    },
  },
  plugins: [],
};
