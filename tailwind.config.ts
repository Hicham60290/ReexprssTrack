
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pacifico': ['Pacifico', 'serif'],
      },
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      // Optimisations pour Core Web Vitals
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      // Améliorations pour mobile
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      // Optimisations pour les performances
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    // Plugin pour améliorer l'accessibilité
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.focus-visible': {
          '&:focus-visible': {
            outline: '2px solid #ea580c',
            outlineOffset: '2px',
            borderRadius: '0.375rem',
          },
        },
        '.skip-link': {
          position: 'absolute',
          left: '-9999px',
          zIndex: '999',
          padding: '8px 16px',
          backgroundColor: '#ea580c',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0 0 8px 0',
          '&:focus': {
            left: '6px',
            top: '7px',
          },
        },
        // Utilitaires pour les performances
        '.gpu-layer': {
          transform: 'translateZ(0)',
          willChange: 'transform',
        },
        '.contain-layout': {
          contain: 'layout',
        },
        '.contain-paint': {
          contain: 'paint',
        },
        '.contain-strict': {
          contain: 'strict',
        },
        // Amélioration des touch targets pour mobile
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        // Optimisation des scrollbars
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f5f9',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: '#94a3b8',
            },
          },
        },
        // Optimisation des images
        '.img-crisp': {
          imageRendering: 'crisp-edges',
          imageRendering: '-webkit-optimize-contrast',
        },
        '.img-smooth': {
          imageRendering: 'smooth',
          imageRendering: 'high-quality',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
