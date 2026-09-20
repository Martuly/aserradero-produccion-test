/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iforest: {
          50: '#F5FAF9',
          100: '#EAF4F2',
          200: '#D6E8E4',
          300: '#B5D4CE',
          400: '#7FAFA5',
          500: '#4F8A81',
          600: '#0F5A55',
          700: '#0D4B47',
          800: '#0A3D39',
          900: '#072F2D',
        },

        ifaccent: {
          50: '#FFF9EC',
          100: '#FFF4DD',
          200: '#FDE7B5',
          300: '#F8D27A',
          400: '#F0BC54',
          500: '#E6A93A',
          600: '#C98E22',
          700: '#A67418',
        },

        pagebg: '#F6F8F9',
        bordersoft: '#DDE5E7',
        textmain: '#1F2937',
        textmuted: '#6B7280',
      },
    },
  },
  plugins: [],
};