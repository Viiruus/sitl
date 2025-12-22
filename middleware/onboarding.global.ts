// middleware/onboarding.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch } = useUserSession()

  // Routes publiques (pas de protection)
  const publicPaths = [
    '/login',
    '/onboarding',
    '/',                // ta home si tu veux la laisser ouverte
  ]

  // routes de callback OAuth (éviter les boucles)
  if (to.path.startsWith('/auth/')) {
    return
  }

  // si la route est publique → on ne fait rien
  if (publicPaths.includes(to.path)) {
    return
  }

  await fetch()

  // Pas connecté → login
  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  // Connecté mais pas onboardé → onboarding obligatoire
  if (user.value && !user.value.onboarded) {
    if (to.path !== '/onboarding') {
      return navigateTo('/onboarding')
    }
  }
  return navigateTo('/profil')
})
