// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = process.env.NODE_ENV === 'production'
const isVercelRuntime = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV)

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
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
    public: {
      blobUploadsEnabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      publicUrl: process.env.PUBLIC_URL || 'http://localhost:3000',
    },
  },
  image: {
    // Keep local DX simple while enabling optimized responsive images in production.
    provider: isVercelRuntime ? 'vercel' : (isProduction ? 'ipx' : 'none'),
    quality: 82,
    format: ['webp'],
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
    '/moniteurs/nicolas-guillemai': { redirect: { to: '/moniteurs/nicolas-guillemain', statusCode: 301 } },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/uploads/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/onboarding': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/register': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/profil': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs/profil': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs/grimpeurs': { robots: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs/cgu': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/moniteurs/aventures/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },
  sitemap: {
    sources: ['/api/__sitemap__/moniteurs', '/api/__sitemap__/stages'],
    exclude: [
      '/escalade-grande-voie',
      '/escalade-sportive-couenne-falaise',
      '/aventures-escalade',
      '/aventures-escalade/**',
      '/login',
      '/onboarding',
      '/register',
      '/profil',
      '/mentions-legales',
      '/politique-de-confidentialite',
      '/moniteurs',
      '/moniteurs/login',
      '/moniteurs/profil',
      '/moniteurs/grimpeurs',
      '/moniteurs/grimpeurs/',
      '/moniteurs/cgu',
      '/moniteurs/aventures/**',
    ],
  },
  robots: {
    disallow: [
      '/escalade-grande-voie',
      '/escalade-sportive-couenne-falaise',
      '/login',
      '/onboarding',
      '/register',
      '/profil',
      '/moniteurs/login',
      '/moniteurs/profil',
      '/moniteurs/grimpeurs',
      '/moniteurs/cgu',
      '/moniteurs/aventures/',
    ],
  },
  site: {
    url: 'https://www.brigadedukiff.com',
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
