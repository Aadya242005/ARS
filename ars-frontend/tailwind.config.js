/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lab: {
          950: '#070b14', 900: '#0a1128', 800: '#0f1a3e',
          700: '#162254', 600: '#1e2d6a', 500: '#2a3d80',
          400: '#3b52a0', 300: '#5570c0', 200: '#8098e0',
          100: '#b3c4f0', 50: '#dfe8fa',
        },
        neon: {
          cyan: '#00f0ff', blue: '#3b82f6', purple: '#a855f7',
          green: '#10b981', amber: '#f59e0b', rose: '#f43f5e',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,240,255,0.15), 0 0 60px rgba(0,240,255,0.05)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.15), 0 0 60px rgba(59,130,246,0.05)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.15), 0 0 60px rgba(168,85,247,0.05)',
        'glow-green': '0 0 20px rgba(16,185,129,0.15), 0 0 60px rgba(16,185,129,0.05)',
        'card': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'float': 'floatY 6s ease-in-out infinite',
        'float-delayed': 'floatY 6s ease-in-out 2s infinite',
        'reveal-bar': 'revealBar 1.2s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,240,255,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0,240,255,0.4), 0 0 60px rgba(0,240,255,0.1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        revealBar: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-w, 80%)' },
        },
      },
    },
  },
  plugins: [],
}