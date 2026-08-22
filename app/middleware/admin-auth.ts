export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user, fetch } = useUserSession()

  if (!loggedIn.value) await fetch()

  if (!loggedIn.value || user.value?.isAdmin !== true) {
    return navigateTo(user.value?.role === 'GUIDE' ? '/moniteurs' : '/')
  }
})

