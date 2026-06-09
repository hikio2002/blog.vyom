/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff', 100: '#e0e9ff', 200: '#c7d7fe', 300: '#a5b8fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        accent: '#f97316',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.700'),
            a: { color: theme('colors.brand.600'), '&:hover': { color: theme('colors.brand.800') } },
            'h1,h2,h3,h4,h5,h6': { fontFamily: 'var(--font-syne)', fontWeight: '700', color: theme('colors.gray.900') },
            pre: { backgroundColor: theme('colors.gray.900') },
            code: { color: theme('colors.brand.600'), backgroundColor: theme('colors.brand.50'), padding: '2px 6px', borderRadius: '4px' },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            img: { borderRadius: '12px' },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: { color: theme('colors.brand.400'), '&:hover': { color: theme('colors.brand.300') } },
            'h1,h2,h3,h4,h5,h6': { color: theme('colors.gray.100') },
            strong: { color: theme('colors.gray.100') },
            blockquote: { color: theme('colors.gray.400'), borderLeftColor: theme('colors.brand.500') },
            code: { color: theme('colors.brand.400'), backgroundColor: theme('colors.brand.900') + '33' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
