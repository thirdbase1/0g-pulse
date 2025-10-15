/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        '0g-purple': '#a06bff',
        '0g-accent': '#cdb3ff',
        '0g-deep': '#6a3dff'
      },
      backgroundImage: {
        '0g-gradient': 'linear-gradient(180deg, #f3edff 0%, #e8e0ff 40%, #ffffff 100%)'
      }
    }
  },
  plugins: []
};
