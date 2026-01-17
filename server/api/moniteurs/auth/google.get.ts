import { buildGoogleAuthUrl, issueOAuthState } from '../../../utils/google-oauth'

export default defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_GUIDE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_GUIDE_CLIENT_SECRET
  const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000'

  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth non configuré (guide).' })
  }

  const redirectUri = `${publicUrl}/api/moniteurs/auth/google/callback`
  const state = issueOAuthState(event, 'google_oauth_state_guide')
  const authUrl = buildGoogleAuthUrl(
    {
      clientId,
      clientSecret,
      redirectUri,
    },
    state,
  )
  return sendRedirect(event, authUrl)
})
