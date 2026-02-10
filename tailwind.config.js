module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        success: {
          400: '#10b981',
          500: '#059669',
          600: '#047857',
        },
        warning: {
          400: '#f59e0b',
          500: '#f97316',
          600: '#ea580c',
        },
        danger: {
          400: '#ef4444',
          500: '#dc2626',
          600: '#b91c1c',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
