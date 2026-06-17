/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brasil: { green: '#009C3B', yellow: '#FFDF00', blue: '#002776' },
        haiti:  { blue: '#00209F', red: '#D21034' },
      },
    },
  },
  plugins: [],
}
