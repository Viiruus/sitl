import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

const CANONICAL_HOST = 'www.brigadedukiff.com'
const APEX_HOST = 'brigadedukiff.com'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  if (url.hostname !== APEX_HOST) {
    return
  }

  url.protocol = 'https:'
  url.hostname = CANONICAL_HOST

  return sendRedirect(event, url.toString(), 301)
})
