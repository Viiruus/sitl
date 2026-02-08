export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user, fetch } = useUserSession()

  if (!loggedIn.value) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value?.role === 'GUIDE') {
    return navigateTo({ path: '/moniteurs', query: { notice: 'guide-only' } })
  }
})
