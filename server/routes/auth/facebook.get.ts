// server/routes/auth/facebook.get.ts
import { isClimberOnboardingComplete } from '../../utils/climber-onboarding'

export default defineOAuthFacebookEventHandler({
  async onSuccess(event, { user, tokens }) {
    // Si tu veux t'assurer qu'on a un email, tu peux vérifier ici
    if (!user.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email requis pour continuer avec Facebook',
      })
    }

    const dbUser = await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        facebookId: user.id,
        acquisitionSource: 'facebook',
      },
      create: {
        email: user.email.toLowerCase(),
        facebookId: user.id,
        acquisitionSource: 'facebook',
        onboarded: false,
      },
    })
    const onboarded = await isClimberOnboardingComplete(prisma, dbUser)

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        onboarded,
        role: dbUser.role,
      },
    })

    return sendRedirect(event, '/onboarding')
  },

  onError(event, error) {
    console.error('Facebook OAuth error:', error)
    return sendRedirect(event, '/login?error=facebook')
  },
})
