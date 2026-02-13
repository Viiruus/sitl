// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', 'nuxt-headlessui', 'nuxt-auth-utils', '@nuxtjs/seo', '@nuxt/image'],
  authUtils: {
    // on demande au module d’activer ces providers OAuth
    providers: ['google', 'facebook'],
  },
  vite: {
    server: {
      // autorise ce host précis
      allowedHosts: [
        'obstinately-uncreditable-remington.ngrok-free.dev',
      ],
      // parfois nécessaire aussi :
      hmr: {
        host: 'obstinately-uncreditable-remington.ngrok-free.dev',
      },
    },
  },
  tailwindcss: {
    // Options
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  runtimeConfig: {
    public: {
      publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
    },
  },
  image: {
    // Keep local DX simple while enabling optimized responsive images in production.
    provider: isProduction ? 'ipx' : 'none',
    quality: 72,
    format: ['avif', 'webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: [
      'images.pexels.com',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'graph.facebook.com',
    ],
  },
  nitro: {
    compressPublicAssets: true,
  },
  routeRules: {
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/api/aventures': { swr: 300 },
  },
  sitemap: {
    exclude: ['/escalade-grande-voie', '/escalade-sportive-couenne-falaise'],
  },
  robots: {
    disallow: ['/escalade-grande-voie', '/escalade-sportive-couenne-falaise'],
  },
  site: {
    url: 'https://brigadedukiff.com',
    name: 'Brigade du kiff — Stages d’escalade avec un collectif de moniteurs diplômés',
    description:
      'Des stages d’escalade outdoor pour progresser avec des moniteurs locaux. Choisis ton terrain de jeu et pars à l’aventure.',
    defaultLocale: 'fr',
    indexable: true,
  },
  app: {
    head: {
      title: 'Stages d’escalade encadrées | Falaise, grande voie, bloc, trad, via ferrata',
      htmlAttrs: {
        lang: 'fr',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})
