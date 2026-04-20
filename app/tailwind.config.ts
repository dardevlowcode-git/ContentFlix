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
        // --- Design System "Intelligent Curator" ---
        // Primary (Action)
        'primary': '#005bbf',
        'primary-container': '#1a73e8',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc7ff',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',
        'inverse-primary': '#adc7ff',

        // Secondary (Operational)
        'secondary': '#2d4add',
        'secondary-container': '#4b65f7',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#fffbff',
        'secondary-fixed': '#dee0ff',
        'secondary-fixed-dim': '#bac3ff',
        'on-secondary-fixed': '#000f5c',
        'on-secondary-fixed-variant': '#052fc8',

        // Tertiary = AI Intelligence (indigo/violet)
        'tertiary': '#6e24f5',
        'tertiary-container': '#8652ff',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffffff',
        'tertiary-fixed': '#e9ddff',
        'tertiary-fixed-dim': '#cfbcff',
        'on-tertiary-fixed': '#22005d',
        'on-tertiary-fixed-variant': '#5400cc',

        // Surface Layers (tonal hierarchy - NO borders rule)
        'surface': '#f7f9ff',
        'surface-dim': '#d7dae0',
        'surface-bright': '#f7f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f4fa',
        'surface-container': '#ebeef4',
        'surface-container-high': '#e5e8ee',
        'surface-container-highest': '#dfe3e8',
        'surface-variant': '#dfe3e8',
        'surface-tint': '#005bc0',

        // On-Surface (text)
        'on-surface': '#181c20',        // Never use #000000
        'on-surface-variant': '#414754',
        'inverse-surface': '#2d3135',
        'inverse-on-surface': '#eef1f7',

        // Background
        'background': '#f7f9ff',
        'on-background': '#181c20',

        // Outline
        'outline': '#727785',
        'outline-variant': '#c1c6d6',

        // Error
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },

      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },

      borderRadius: {
        DEFAULT: '0.125rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },

      boxShadow: {
        // Ambient shadows only — ultra-diffused, max 6% opacity (no heavy shadows rule)
        'ambient': '0px 8px 32px rgba(24, 28, 32, 0.06)',
        'ambient-md': '0px 4px 16px rgba(24, 28, 32, 0.08)',
        'primary-glow': '0px 4px 24px rgba(0, 91, 191, 0.20)',
        'tertiary-glow': '0px 4px 24px rgba(110, 36, 245, 0.25)',
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
