/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0',
        },
        primary: {
          DEFAULT: '#006A4E',
          hover: '#005740',
          dark: '#004D38',
          light: '#D1FAE5',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#00875A',
          hover: '#00704B',
          foreground: '#FFFFFF',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#00875A',
          800: '#006A4E',
          900: '#004D38',
          950: '#002B1F',
        },
        charcoal: {
          DEFAULT: '#111827',
          muted: '#6B7280',
          subtle: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0px 1px 3px rgba(17, 24, 39, 0.04), 0px 8px 16px -4px rgba(17, 24, 39, 0.02)',
        'hero': '0px 10px 24px -6px rgba(0, 106, 78, 0.20)',
        'popover': '0px 12px 28px -4px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}

