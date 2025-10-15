/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}', // optional if you have a src folder
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9b5de5',   // vibrant purple
        accent: '#f15bb5',    // pink-purple accent
        deep: '#6a0dad',      // deep purple
        text: '#1b0d2c',      // dark text
      },
      backgroundImage: {
        '0g-gradient': 'linear-gradient(180deg, #e0c3fc 0%, #8ec5fc 40%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
}
