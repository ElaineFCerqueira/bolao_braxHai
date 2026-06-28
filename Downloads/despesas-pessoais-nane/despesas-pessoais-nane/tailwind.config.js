/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1E3A5F',
          DEFAULT: '#2563EB',
          light: '#3B82F6'
        },
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
