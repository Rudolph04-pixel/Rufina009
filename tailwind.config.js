// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',               // tu HTML principal
    './src/**/*.{js,jsx,ts,tsx}', // todos tus componentes React
  ],
  // habilita modo oscuro vía la clase “.dark” en tu <html> o <body>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // tu paleta “brand” para clases bg-brand-xxx, text-brand-xxx…
        brand: {
          50:  '#f5faff',
          100: '#e6f2ff',
          200: '#b8dbff',
          300: '#8ac3ff',
          400: '#5baaff',
          500: '#1226b8ff', // tu color principal en light mode
          600: '#0077e6',
          700: '#005bab',
          800: '#003f70',
          900: '#002335',
        },
        // escala de grises genérica
        gray: {
          50:  '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },

        // tokens CSS-variables mapeados como utilidades Tailwind
        border: {
          DEFAULT: '#215098ff', // mismo que gray.300 en light
          dark:    '#8994a1ff', // mismo que gray.600 en dark
        },
        background: {
          DEFAULT: '#0a4b85bb', // bg-background en modo claro
          dark:    '#11386aff', // bg-background en modo oscuro
        },
        foreground: {
          DEFAULT: '#160606ff', // text-foreground en modo claro
          dark:    '#121d28ff', // text-foreground en modo oscuro
        },
      },
    },
  },
  plugins: [],
}
