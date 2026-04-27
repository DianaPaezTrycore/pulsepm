/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          50: '#FEF8F0',
          100: '#FDEEDC',
          200: '#FBD9B5',
          300: '#F8BC85',
          400: '#F49751',
          500: '#F07820',
          600: '#E0610F',
          700: '#B94A0E',
          800: '#933C12',
          900: '#763212',
        },
        hedgehog: {
          light: '#D4A574',
          DEFAULT: '#8B6F47',
          dark: '#5D4A2E',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          500: '#64748B',
          700: '#334155',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
