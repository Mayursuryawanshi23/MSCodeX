/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Custom responsive breakpoints for mobile devices
    screens: {
      'xs': '375px',  // Small phones (iPhone SE)
      'sm': '640px',  // Phones
      'md': '768px',  // Tablets
      'lg': '1024px', // Laptops
      'xl': '1280px', // Desktops
      '2xl': '1536px', // Large screens
    },
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#b3e0ff',
          200: '#80caff',
          300: '#4db3ff',
          400: '#1a9cff',
          500: '#0080ff',
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        secondary: {
          50: '#e6fff2',
          100: '#b3ffd6',
          200: '#80ffad',
          300: '#4dff85',
          400: '#1aff5c',
          500: '#00e633',
          600: '#00b829',
          700: '#008a1f',
          800: '#005c14',
          900: '#002e0a',
        },
        accent: {
          50: '#f0f8ff',
          100: '#d1e7ff',
          200: '#a3cfff',
          300: '#75b7ff',
          400: '#47a0ff',
          500: '#1989ff',
          600: '#006dcc',
          700: '#005299',
          800: '#003666',
          900: '#001b33',
        },
        neutral: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#cccccc',
          300: '#b8b8b8',
          400: '#a3a3a3',
          500: '#8f8f8f',
          600: '#7a7a7a',
          700: '#666666',
          800: '#525252',
          900: '#3d3d3d',
        },
      },
      backgroundColor: {
        'theme-bg': '#0a0a0a',
        'theme-surface': '#1a1a1a',
        'theme-card': '#2a2a2a',
      },
      textColor: {
        'theme-text': '#ffffff',
        'theme-text-secondary': '#cccccc',
        'theme-text-muted': '#888888',
      },
      borderColor: {
        'theme-border': '#333333',
        'theme-border-light': '#444444',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      zIndex: {
        '0': '0',
        '1': '1',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
      },
    },
  },
  plugins: [],
}
