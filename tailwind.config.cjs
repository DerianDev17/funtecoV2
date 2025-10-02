/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6F6AC3',
          light: '#EBABC5',
          dark: '#82007C'
        },
        accent: {
          DEFAULT: '#F47AAA',
          flamingo: '#F58FB6',
          blush: '#EBABC5'
        },
        neutral: {
          DEFAULT: '#F2DFC8',
          black: '#000000'
        },
        panafrican: {
          red: '#E31B23',
          green: '#12853F',
          black: '#000000'
        }
      }
    }
  },
  plugins: [],
};
