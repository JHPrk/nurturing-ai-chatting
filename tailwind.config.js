/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './tests/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      colors: {
        pink: {
          50: '#FCE4EC',
          100: '#F8BBD9',
          500: '#C2185B',
          600: '#AD1457',
          900: '#880E4F',
        },
        blue: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          500: '#00796B',
        },
        teal: {
          800: '#00695C',
        },
      },
    },
  },
  plugins: [],
} 