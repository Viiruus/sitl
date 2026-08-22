import { assertOAuthState, exchangeCodeForTokens, getGoogleUser } from '../../../../utils/google-oauth'
import { prisma } from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_GUIDE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_GUIDE_CLIENT_SECRET
  const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000'

  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Google OAuth non configuré (guide).' })
  }

  const query = getQuery(event)
  const code = query.code as string | undefined
  const state = query.state as string | undefined
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Code manquant.' })
  }

  assertOAuthState(event, 'google_oauth_state_guide', state)

  const tokens = await exchangeCodeForTokens(
    {
      clientId,
      clientSecret,
      redirectUri: `${publicUrl}/api/moniteurs/auth/google/callback`,
    },
    code,
  )

  const googleUser = await getGoogleUser(tokens.access_token)
  const normalizedEmail = googleUser.email?.toLowerCase()

  const db = await prisma()

  const existing = await db.user.findFirst({
    where: {
      OR: [{ googleId: googleUser.sub }, { email: normalizedEmail }],
    },
  })

  if (existing && existing.role !== 'GUIDE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Ce compte Google est déjà associé à un compte grimpeur. Utilise la connexion grimpeur.',
    })
  }

  const user = await db.user.upsert({
    where: { googleId: googleUser.sub },
    update: {
      email: normalizedEmail,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      role: 'GUIDE',
    },
    create: {
      email: normalizedEmail,
      googleId: googleUser.sub,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      role: 'GUIDE',
      phoneNumber: '',
      whatsappOptIn: false,
    },
  })

  await db.guideProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, isPublic: true },
  })

  await setUserSession(event, null as any)
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      onboarded: user.onboarded,
      role: user.role,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return sendRedirect(event, '/moniteurs')
})
