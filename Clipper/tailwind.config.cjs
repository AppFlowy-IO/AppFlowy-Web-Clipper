const colors = require('./tailwind/colors.cjs');
const boxShadow = require('./tailwind/box-shadow.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  important: '#body',
  darkMode: 'class',
  theme: {
    extend: {
      colors,
      boxShadow,
    },
  },
  plugins: [
    require('tailwindcss-debug-screens'),
  ],
};
