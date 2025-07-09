/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          primary: '#ff6b6b',
          secondary: '#4ecdc4',
          accent: '#45b7d1',
          neon: {
            pink: '#ff69b4',
            blue: '#00ffff',
            green: '#00ff00',
            yellow: '#ffff00'
          },
          dark: '#1a1a2e',
          darker: '#16213e'
        }
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
        'crane-sway': 'crane-sway 3s ease-in-out infinite',
        'prize-bounce': 'prize-bounce 0.6s ease-out',
        'token-spin': 'token-spin 1s linear infinite'
      },
      keyframes: {
        'neon-pulse': {
          '0%': { 
            textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff69b4, 0 0 20px #ff69b4',
            boxShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff69b4, 0 0 20px #ff69b4'
          },
          '100%': { 
            textShadow: '0 0 2px #fff, 0 0 5px #fff, 0 0 7px #ff69b4, 0 0 10px #ff69b4',
            boxShadow: '0 0 2px #fff, 0 0 5px #fff, 0 0 7px #ff69b4, 0 0 10px #ff69b4'
          }
        },
        'crane-sway': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' }
        },
        'prize-bounce': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'token-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
} 