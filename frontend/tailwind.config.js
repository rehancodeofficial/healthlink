/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hb-cream': 'var(--hb-cream)',
        'hb-cream-deep': 'var(--hb-cream-deep)',
        'hb-ink': 'var(--hb-ink)',
        'hb-ink-soft': 'var(--hb-ink-soft)',
        'hb-red': 'var(--hb-red)',
        'hb-red-deep': 'var(--hb-red-deep)',
        'hb-green': 'var(--hb-green)',
      },
      borderRadius: {
        'r-sm': 'var(--r-sm)',
        'r-md': 'var(--r-md)',
        'r-lg': 'var(--r-lg)',
        'r-xl': 'var(--r-xl)',
      },
    },
  },
  plugins: [],
}
