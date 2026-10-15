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
        navy: {
          950: '#070a14', // Ultra deep cosmic navy background
          900: '#0c1224', // Primary dark canvas
          850: '#111a33', // Deep glass surface
          800: '#162345', // Card background
          750: '#1c2d58', // Card hover / border
          700: '#23376b',
          600: '#324e96',
        },
        brand: {
          blue: '#3b82f6',
          cyan: '#38bdf8',
          violet: '#8b5cf6',
          purple: '#a855f7',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.18), transparent 70%)',
        'card-glow': 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.12), transparent 50%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(139, 92, 246, 0.25)',
        'glow-md': '0 0 30px rgba(139, 92, 246, 0.35)',
        'glow-blue': '0 0 25px rgba(56, 189, 248, 0.25)',
      },
    },
  },
  plugins: [],
}
