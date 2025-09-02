/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Scan all JS/TS/JSX/TSX files in src
  ],
 
    theme: {
      extend: {
        colors: {
          blueGray: {
            200: '#E2E8F0',
            300: '#CBD5E0',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
          },
          lightBlue: {
            400: '#38BDF8',
            600: '#0284C7',
          },
          pink: {
            400: '#F472B6',
          },
        }
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },

  plugins: [], // Add plugins if needed
};