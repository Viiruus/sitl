import { prisma } from './prisma'

export async function requireBrigadeImageBankGuide(event: any) {
  const session = await getUserSession(event)
  const id = Number(session?.user?.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session?.user?.role !== 'GUIDE' || !session.user.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs inscrits' })
  }
  const db = await prisma()
  const guide = await db.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, role: true, onboarded: true },
  })
  if (guide?.role !== 'GUIDE' || !guide.onboarded) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs inscrits' })
  }
  return { db, guide }
}
