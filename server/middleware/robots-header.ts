import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler((event) => {
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
})
