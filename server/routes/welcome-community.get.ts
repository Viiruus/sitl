export default defineEventHandler((event) => {
  return sendRedirect(event, '/profil', 301)
})
