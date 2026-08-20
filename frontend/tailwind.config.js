/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ualg: {
          navy: '#0d1b4b',
          blue: '#1a3a8f',
          gold: '#f0a500',
          'gold-light': '#fbbf24',
          cream: '#fdf9f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
