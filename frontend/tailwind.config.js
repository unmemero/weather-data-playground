/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        meteor: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#38bdf8',
          solar: '#f59e0b',
          temp: '#f43f5e',
          humidity: '#06b6d4',
          wind: '#10b981',
          pressure: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
