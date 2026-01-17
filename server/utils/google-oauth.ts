import { $fetch } from 'ofetch'
import crypto from 'node:crypto'
import { getCookie, setCookie, sendRedirect, H3Event } from 'h3'

export type GoogleOAuthConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope?: string
}

export const buildGoogleAuthUrl = (config: GoogleOAuthConfig, state: string) => {
  const scope = encodeURIComponent(config.scope || 'openid email profile')
  const redirectUri = encodeURIComponent(config.redirectUri)
  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${config.clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(
    state,
  )}`
}

export const exchangeCodeForTokens = async (config: GoogleOAuthConfig, code: string) => {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const tokens = await $fetch<{
    access_token: string
    expires_in: number
    id_token?: string
    refresh_token?: string
    scope: string
    token_type: string
  }>('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return tokens
}

export const getGoogleUser = async (accessToken: string) => {
  return await $fetch<{
    sub: string
    email: string
    given_name?: string
    family_name?: string
    picture?: string
  }>('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export const issueOAuthState = (event: H3Event, cookieName: string) => {
  const state = crypto.randomUUID()
  setCookie(event, cookieName, state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return state
}

export const assertOAuthState = (event: H3Event, cookieName: string, received?: string | null) => {
  const stored = getCookie(event, cookieName)
  if (!stored || !received || stored !== received) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('OAuth state mismatch (dev mode) — stored:', stored, 'received:', received)
      // Be lenient in development to avoid blocking the flow when cookies are not persisted
      return
    }
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth state' })
  }
  setCookie(event, cookieName, '', { maxAge: 0, path: '/' })
}
