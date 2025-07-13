/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000',
        secondary: '#666',
        surface: '#f8f9fa',
        border: '#e9ecef',
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      transitionProperty: {
        'all': 'all',
      },
      transitionTimingFunction: {
        'bezier': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    darkMode: 'class',
  },
  plugins: [],
}

