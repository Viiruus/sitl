export default defineEventHandler((event) => {
  if (process.env.NODE_ENV !== 'production') return

  const host = getRequestHost(event, { xForwardedHost: true }).toLowerCase()
  if (host !== 'www.brigadedukiff.com') return

  const url = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true,
  })
  url.host = 'brigadedukiff.com'

  return sendRedirect(event, url.toString(), 301)
})
