export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path === '/login') {
    const open = useState<boolean>('auth-modal-open', () => false)
    open.value = true

    // If there is a previous page, stay on it; otherwise fall back to home.
    if (from && from.fullPath) {
      return abortNavigation()
    }
    return navigateTo('/', { replace: true })
  }
})
