/* Commento didattico:
 * Scopo del file: configurazione di progetto usata in fase di build/esecuzione.
 * Flusso: questo file viene letto automaticamente da Next.js/tooling per definire il comportamento globale dell'app.
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm Editorial tokens (CONVENTIONS.md §5)
        'canvas-cream': '#F3F0EE',
        'lifted-cream': '#FCFBFA',
        'ink-black': '#141413',
        'slate-gray': '#696969',
        'light-signal-orange': '#F37338',
        'signal-orange': '#CF4500',
        'white': '#FFFFFF',

        // Semantic aliases used by existing components.
        'primary': '#141413',
        'primary-container': '#2A2928',
        'on-primary': '#FCFBFA',
        'on-primary-container': '#FCFBFA',
        'primary-fixed': '#FCFBFA',
        'primary-fixed-dim': '#E7DFDA',
        'on-primary-fixed': '#141413',
        'on-primary-fixed-variant': '#2A2928',
        'inverse-primary': '#F37338',

        'secondary': '#F37338',
        'secondary-container': '#CF4500',
        'on-secondary': '#FFFFFF',
        'on-secondary-container': '#FFFFFF',
        'secondary-fixed': '#FCE1D5',
        'secondary-fixed-dim': '#F9BF9F',
        'on-secondary-fixed': '#5E1D00',
        'on-secondary-fixed-variant': '#8F2E00',

        // "Tertiary" alias preserved for backward-compatibility; mapped to orange family.
        'tertiary': '#F37338',
        'tertiary-container': '#CF4500',
        'on-tertiary': '#FFFFFF',
        'on-tertiary-container': '#FFFFFF',
        'tertiary-fixed': '#FCE1D5',
        'tertiary-fixed-dim': '#F9BF9F',
        'on-tertiary-fixed': '#5E1D00',
        'on-tertiary-fixed-variant': '#8F2E00',

        'surface': '#F3F0EE',
        'surface-dim': '#E7DFDA',
        'surface-bright': '#FCFBFA',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#FCFBFA',
        'surface-container': '#F7F3F1',
        'surface-container-high': '#EFE9E5',
        'surface-container-highest': '#E7DFDA',
        'surface-variant': '#E7DFDA',
        'surface-tint': '#F37338',

        'on-surface': '#141413',
        'on-surface-variant': '#696969',
        'inverse-surface': '#141413',
        'inverse-on-surface': '#FCFBFA',

        'background': '#F3F0EE',
        'on-background': '#141413',

        'outline': '#B7ADA6',
        'outline-variant': '#D8D0CA',

        // Error
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },

      fontFamily: {
        headline: ['var(--font-sofia-sans)', 'Inter', 'Arial', 'sans-serif'],
        body: ['var(--font-sofia-sans)', 'Inter', 'Arial', 'sans-serif'],
        label: ['var(--font-sofia-sans)', 'Inter', 'Arial', 'sans-serif'],
        sans: ['var(--font-sofia-sans)', 'Inter', 'Arial', 'sans-serif'],
      },

      borderRadius: {
        DEFAULT: '1.25rem',
        sm: '0.75rem',
        md: '1.25rem',
        lg: '2.5rem',
        xl: '2.5rem',
        '2xl': '2.5rem',
        full: '999px',
      },

      boxShadow: {
        'ambient': '0 8px 24px rgba(20, 20, 19, 0.06)',
        'ambient-md': '0 4px 16px rgba(20, 20, 19, 0.08)',
        'primary-glow': '0 6px 20px rgba(20, 20, 19, 0.18)',
        'tertiary-glow': '0 6px 20px rgba(243, 115, 56, 0.22)',
      },

      animation: {
        'pulse-soft': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },

      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}

export default config
