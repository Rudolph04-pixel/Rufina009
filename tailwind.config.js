// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content:[
    './index.html',               // tu HTML principal
    './src/**/*.{js,jsx,ts,tsx}', // todos tus componentes React
  ],
  darkMode: 'class', // si usas modo oscuro
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5faff',
          100: '#e6f2ff',
          200: '#b8dbff',
          300: '#8ac3ff',
          400: '#5baaff',
          500: '#2d92ff', // tu color principal
          600: '#0077e6',
          700: '#005bab',
          800: '#003f70',
          900: '#002335',
        },
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
        // Token "border" para generar .border-border
        border: {
          DEFAULT: '#d1d5db',  // mismo que gray.300
          dark:   '#4b5563',   // mismo que gray.600 en modo oscuro
        },
        // Token "background" para bg-background y dark:bg-background
        background: {
          DEFAULT: '#ffffff',  // bg-background en claro
          dark:    '#1f2937',  // bg-background en oscuro
        },
        // Token "foreground" para text-foreground y dark:text-foreground
        foreground: {
          DEFAULT: '#111827',  // color de texto en modo claro (gray.900)
          dark:    '#f9fafb',  // color de texto en modo oscuro (gray.50)
        }
      }
    }
  },
  plugins: []
}
