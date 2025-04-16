/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Mobile-first breakpoints
    screens: {
      sm: '480px',    // Small mobile devices
      md: '768px',    // Tablets and larger phones
      lg: '1024px',   // Laptops/desktops
      xl: '1280px',   // Large desktops
      '2xl': '1536px' // Extra large screens
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Discord-inspired colors
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
          white: '#FFFFFF',
          black: '#000000',
          primary: '#5865F2',
          secondary: '#4E5058',
          tertiary: '#36393F',
          background: '#36393F',
          channelsBg: '#2F3136',
          membersBg: '#2F3136',
          chatInputBg: '#40444B',
          backgroundFloating: '#18191C',
          backgroundModifierHover: 'rgba(79, 84, 92, 0.16)',
          backgroundModifierActive: 'rgba(79, 84, 92, 0.24)',
          backgroundModifierSelected: 'rgba(79, 84, 92, 0.32)',
          backgroundModifierAccent: 'rgba(79, 84, 92, 0.48)',
          textNormal: '#DCDDDE',
          textMuted: '#A3A6AA',
          textLink: '#00AFF4',
        },
        // Modern gradient colors
        gradient: {
          blue: '#5865F2',
          purple: '#8B5CF6',
          pink: '#EC4899',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          rose: '#F43F5E',
          amber: '#F59E0B',
          emerald: '#10B981',
          cyan: '#06B6D4',
        },
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.1)',
          darkMedium: 'rgba(0, 0, 0, 0.15)',
          darkHeavy: 'rgba(0, 0, 0, 0.25)',
        },
        // Updated app colors
        background: '#F9FAFB',
        foreground: '#333333',
        primary: {
          DEFAULT: '#5865F2', // Discord blurple
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#EB459E', // Discord fuchsia
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#57F287', // Discord green
          foreground: '#FFFFFF'
        },
        success: '#57F287', // Discord green
        warning: '#FEE75C', // Discord yellow
        error: '#ED4245',   // Discord red
        muted: {
          DEFAULT: 'rgba(79, 84, 92, 0.16)',
          foreground: '#A3A6AA'
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          foreground: '#DCDDDE'
        },
        popover: {
          DEFAULT: 'rgba(47, 49, 54, 0.95)',
          foreground: '#DCDDDE'
        },
        destructive: {
          DEFAULT: '#ED4245',
          foreground: '#FFFFFF'
        },
        border: 'rgba(79, 84, 92, 0.24)',
        input: 'rgba(79, 84, 92, 0.16)',
        ring: '#5865F2',
      },
      backgroundImage: {
        'gradient-discord': 'linear-gradient(to bottom right, #5865F2, #EB459E)',
        'gradient-discord-alt': 'linear-gradient(to bottom right, #5865F2, #8B5CF6, #EB459E)',
        'gradient-blurple': 'linear-gradient(to right, #5865F2, #8B5CF6)',
        'gradient-fuchsia': 'linear-gradient(to right, #EB459E, #D946EF)',
        'gradient-green': 'linear-gradient(to right, #57F287, #10B981)',
        'gradient-blue-purple': 'linear-gradient(to bottom right, #5865F2, #8B5CF6)',
        'gradient-purple-pink': 'linear-gradient(to bottom right, #8B5CF6, #EC4899)',
        'gradient-blue-cyan': 'linear-gradient(to bottom right, #5865F2, #06B6D4)',
        'gradient-cyan-green': 'linear-gradient(to bottom right, #06B6D4, #10B981)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      },
      boxShadow: {
        'discord': '0 8px 16px rgba(0, 0, 0, 0.24)',
        'discord-lg': '0 8px 24px rgba(0, 0, 0, 0.32)',
        'discord-xl': '0 12px 32px rgba(0, 0, 0, 0.4)',
        'glass': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'inner-glow': 'inset 0 0 8px rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        'discord': '8px',
        'discord-lg': '16px',
        'discord-xl': '24px',
        'full': '9999px',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    }
  },
  plugins: [
    import("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.125)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(47, 49, 54, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
        '.glass-card': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.125)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        '.noise': {
          position: 'relative',
        },
        '.noise::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          opacity: '0.05',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        },
        '.inner-border': {
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};