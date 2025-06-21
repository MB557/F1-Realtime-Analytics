/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          black: '#15151E',
          white: '#FFFFFF',
          gray: '#949498',
        },
        teams: {
          redbull: '#3671C6',
          mercedes: '#27F4D2',
          ferrari: '#E8002D',
          mclaren: '#FF8000',
          alpine: '#0093CC',
          astonmartin: '#229971',
          alphatauri: '#5E8FAA',
          alfaromeo: '#C92D4B',
          haas: '#B6BABD',
          williams: '#37BEDD',
        },
        battle: {
          'very-high': '#ff4444',
          'high': '#ff8800',
          'medium': '#ffaa00',
          'low': '#ffdd00',
        }
      },
      fontFamily: {
        f1: ['Formula1', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
} 