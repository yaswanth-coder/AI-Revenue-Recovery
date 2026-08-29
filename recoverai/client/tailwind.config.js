/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#040706',
          secondary: '#080e0b',
          tertiary: '#0e1612',
          card: '#0c130f',
          surface: '#111b15',
          border: '#1a2920',
          hover: '#14221a',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        fintech: {
          green: '#10b981',
          mint: '#34d399',
          teal: '#0d9488',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#8b5cf6',
          slate: '#64748b',
          darkSlate: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px -2px rgba(16, 185, 129, 0.25)',
        'glow-md': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-lg': '0 0 30px -5px rgba(16, 185, 129, 0.45)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
