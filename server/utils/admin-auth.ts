import { prisma } from './prisma'

export const requireAdmin = async (event: any) => {
  const session = await getUserSession(event)
  const userId = Number(session?.user?.id)

  if (!Number.isInteger(userId) || userId <= 0) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }

  const db = await prisma()
  const admin = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isAdmin: true },
  })

  // La vérification en base évite qu’une ancienne session conserve des droits révoqués.
  if (!admin?.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux administrateurs' })
  }

  return { db, admin, session }
}

