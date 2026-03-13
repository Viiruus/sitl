export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user, fetch } = useUserSession()

  if (!loggedIn.value) {
    await fetch()
  }

  if (!loggedIn.value || user.value?.role !== 'GUIDE') {
    return navigateTo('/moniteurs/login')
  }

  if (!user.value?.onboarded) {
    return navigateTo('/moniteurs/login')
  }
})
