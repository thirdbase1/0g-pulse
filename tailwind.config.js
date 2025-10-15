/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'og-purple': '#a06bff',
        'og-accent': '#cdb3ff',
        'og-deep': '#6a3dff',
      },
      backgroundImage: {
        'og-gradient': 'linear-gradient(180deg, #f3edff 0%, #e8e0ff 40%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
}
