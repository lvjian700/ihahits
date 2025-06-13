/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'color-title': '#1E3A5F',
        'color-subtitle': '#2D4A6D',
        'color-text': '#4A5568',
        'color-text-light': '#718096',
        'color-background': '#FCF7EE'
      },
      fontFamily: {
        sans: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'title-lg': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'title': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'subtitle': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }]
      }
    }
  },
  plugins: []
};