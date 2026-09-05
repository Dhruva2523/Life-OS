/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: '#09090b',
          surface: '#18181b',
          card: '#1e1f24',
          border: '#27272a',
          title: '#f4f4f5',
          body: '#a1a1aa',
          subtle: '#71717a',
          accent: '#e4e4e7',
        },
        slate: {
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#334155',
          border: '#475569',
          title: '#f8fafc',
          body: '#94a3b8',
          subtle: '#64748b',
          accent: '#cbd5e1',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      screens: {
        'mobile': '390px', // Target iPhone 13 width
      }
    },
  },
  plugins: [],
};
