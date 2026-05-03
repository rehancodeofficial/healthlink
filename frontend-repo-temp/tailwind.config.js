/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ all your React components & pages
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#026806ff",
          light: "#0c0135ff",
        },
        accent: {
          orange: "#E67514",
        },
        black: "#000000",
        lightBg: "#e2fce3",
      },
    },
  },
  plugins: [],
};
