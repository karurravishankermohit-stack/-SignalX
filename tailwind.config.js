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
        signalx: {
          bg: '#080A0F',             // True technical dark background
          surface: '#0E121C',        // Primary panel surface
          surfaceSubtle: '#131826',  // Secondary header/toolbar surface
          card: '#161C2B',           // Elevated technical card
          cardHover: '#1B2234',      // Hover state
          border: '#1E2638',         // Crisp 1px neutral divider
          borderLight: '#2C374E',    // Active border highlight
          accent: '#0284C7',         // Controlled technical blue
          accentLight: '#38BDF8',    // Trace/active highlight
          cyan: '#0284C7',           // Replaced bright neon with controlled engineering blue
          cyanDim: '#0369A1',        
          emerald: '#10B981',        // Status: Complete / Locked
          amber: '#F59E0B',          // Status: Synthetic / Warning
          rose: '#F43F5E',           // Status: Error / Noise
          slate: '#94A3B8',          // Secondary labels
          dark: '#05070B',           // Deep instrument viewport background
          abyss: '#0A0F1C',          // Deep abyss mesh gradient base
          abyssDark: '#030712',      // Deep void black
          electric: '#0055FF',       // Electric Blue accent
          neonCyan: '#00F0FF',       // Pure Aerospace Cyan
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'instrument': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'panel': '0 4px 12px -2px rgba(0, 0, 0, 0.5)',
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.35)',
        'glow-cyan-sm': '0 0 8px rgba(0, 240, 255, 0.3)',
        'glow-cyan-lg': '0 0 25px rgba(0, 240, 255, 0.5)',
        'glow-blue': '0 0 15px rgba(0, 85, 255, 0.35)',
        'glow-emerald': '0 0 12px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 12px rgba(245, 158, 11, 0.35)',
        'glow-rose': '0 0 12px rgba(244, 63, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
