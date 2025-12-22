// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', 'nuxt-headlessui', 'nuxt-auth-utils'],
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
  app: {
    head: {
      title: 'Nuxt', // default fallback title
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})