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
        navy: {
          950: '#0B0F19', // Main Application Background
          900: '#101726', // Surface / Sidebar / Topbar
          850: '#131D31', // Card Surface
          800: '#1A243B', // Elevated Hover / Secondary
          750: '#1E2B45', // Highlighted Surface
          700: '#23304E', // Borders
          600: '#334155', // Subtle Borders
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        primary: {
          DEFAULT: '#3B82F6', // Blue primary
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple secondary
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #2563EB, #7C3AED)',
        'navy-gradient': 'linear-gradient(to bottom, #101726, #0B0F19)',
      }
    },
  },
  plugins: [],
}
