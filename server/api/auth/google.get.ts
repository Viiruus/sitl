import { buildGoogleAuthUrl, issueOAuthState } from '../../utils/google-oauth'

export default defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_CLIMBER_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIMBER_CLIENT_SECRET
  const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000'

  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth non configuré (climber).' })
  }

  const redirectUri = `${publicUrl}/api/auth/google/callback`
  const state = issueOAuthState(event, 'google_oauth_state_climber')
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
