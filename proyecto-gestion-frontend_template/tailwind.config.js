/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0097A7',
          dark: '#007C91',
          light: '#26C6DA',
          soft: '#B2EBF2',
          'very-light': '#E0F7FA',
        },
        text: {
          primary: '#263238',
          secondary: '#546E7A',
        },
        border: '#CFD8DC',
        background: {
          light: '#ECEFF1',
          dark: '#0A1929',
        },
        success: '#43A047',
        danger: '#E53935',
        warning: '#F9A825',
        info: '#00ACC1',
        disabled: '#B0BEC5',
        hover: '#00B8D4',
        link: '#039BE5',
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}