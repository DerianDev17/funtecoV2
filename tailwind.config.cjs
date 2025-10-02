/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // azul principal
          light: '#3b82f6',
          dark: '#1e40af'
        }
      }
    }
  },
  plugins: [],
};