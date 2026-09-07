/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pastel: {
          sakura: {
            50: '#FFF5F5',
            100: '#FDE2E4',
            200: '#FAD2E1',
            300: '#FFB7C5',
            400: '#F48498',
            500: '#E56B82',
            600: '#C24B63',
          },
          lavender: {
            50: '#F8F7FF',
            100: '#EFEAFF',
            200: '#DDD4FF',
            300: '#BDB2FF',
            400: '#A194F7',
            500: '#8A7BEF',
            600: '#6C58E0',
          },
          matcha: {
            50: '#F5FAF7',
            100: '#E2F0E8',
            200: '#C7E4D3',
            300: '#8EB69B',
            400: '#70A288',
            500: '#538D6D',
            600: '#3D6C52',
          },
          nordic: {
            50: '#F3FAFC',
            100: '#E1F5FE',
            200: '#BEE7F9',
            300: '#90E0EF',
            400: '#48CAE4',
            500: '#00B4D8',
            600: '#0096C7',
          },
          buttercup: {
            50: '#FFFCF2',
            100: '#FFF8E1',
            200: '#FFECB3',
            300: '#FFEAA7',
            400: '#FAD02C',
            500: '#F6B93B',
            600: '#E58E26',
          },
          noir: {
            bg: '#0F1015',
            sidebar: '#161821',
            card: '#1F2230',
            border: '#2C3044',
            text: '#F1F3F9',
            muted: '#8A92A6',
          }
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'pastel-glow': '0 0 20px -3px var(--glow-color, rgba(189, 178, 255, 0.35))',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'spring-pop': 'springPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-subtle': 'pulseSubtle 3s infinite ease-in-out',
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        springPop: {
          '0%': { transform: 'scale(0.85)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
