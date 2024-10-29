/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#11190c',  // Dark green
          white: '#F3F1EE'     // Off-white
        },
        secondary: {
          lime: '#e6ff00',     // Bright lime
          dark: '#0a0f07',     // Darker shade of primary
          gray: '#444638',     // Dark gray
          olive: '#787664',    // Olive gray
          light: '#F3F1EE',    // Light background
          beige: '#E5E2DC'     // Slightly darker than light
        }
      },
      fontFamily: {
        moonwalk: ['Moon Walk', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif']
      },
      backgroundColor: {
        base: '#F3F1EE'  // Default background color
      }
    },
  },
  plugins: [],
};