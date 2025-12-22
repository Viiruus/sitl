import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'

const brandPalette = {
  ...colors.sky,
  DEFAULT: colors.sky[500],
}

const secondaryBrandPalette = {
  ...colors.amber,
  DEFAULT: colors.amber[500],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
    './app/composables/**/*.{js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}',
    './app.config.{js,ts}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
    },
    extend: {
      colors: {
        brand: brandPalette,
        secondaryBrand: secondaryBrandPalette,
        surface: {
          base: '#0b0d11',
          muted: '#111827',
          contrast: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
        display: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        '4xl': '2.5rem',
      },
      boxShadow: {
        card: '0 25px 60px -35px rgba(15, 23, 42, 0.65)',
        glow: '0 0 45px rgba(251, 191, 36, 0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(146, 64, 14, 0.95))',
      },
    },
  },
  plugins: [],
}
