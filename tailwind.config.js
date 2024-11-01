module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#496F68',
          DEFAULT: '#1c4b43',
          dark: '#13342E',
          contrastText: '#fff',
        },
        secondary: {
          DEFAULT: '#e7dbba',
          light: '#EBE2C7',
          dark: '#A19982',
          contrastText: '##000000de',
        },
      },
    },
    container: {
      padding: '2rem',
      center: true,
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
