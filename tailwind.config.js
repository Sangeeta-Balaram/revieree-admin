/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fef2f3",
          100: "#fde6e8",
          200: "#faccce",
          300: "#f7a3a8",
          400: "#f26f78",
          500: "#e8404d",
          600: "#c92a36",
          700: "#9A2530",
          800: "#7d1e27",
          900: "#5c1117",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdfbf7",
          200: "#fbf6ef",
          300: "#f8f0e5",
          400: "#f5e9d8",
          500: "#f0ddc7",
        },
      },
      fontFamily: {
        serif: ["Libre Baskerville", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
