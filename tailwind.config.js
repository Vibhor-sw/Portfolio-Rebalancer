/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-green': '#16a34a',
        'brand-red': '#dc2626',
        'brand-orange': '#ea580c',
        'brand-grey': '#6b7280',
      },
    },
  },
  plugins: [],
}
