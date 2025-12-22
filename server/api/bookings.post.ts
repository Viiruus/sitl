// server/api/bookings.post.ts
import { PrismaClient } from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const prisma = new PrismaClient({ adapter })

export default defineEventHandler(async (event) => {
  const sessionAuth = await getUserSession(event)

  if (!sessionAuth?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Tu dois être connecté·e pour réserver.',
    })
  }

  const userId = Number(sessionAuth.user.id)
  if (Number.isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Identifiant utilisateur invalide.',
    })
  }

  const body = await readBody<{ sessionId?: number | string }>(event)
  const sessionId = Number(body.sessionId)

  if (!sessionId || Number.isNaN(sessionId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'SessionId manquant ou invalide.',
    })
  }

  // Vérifier que la session existe
  const dbSession = await prisma.aventureSession.findUnique({
    where: { id: sessionId },
    include: { aventure: true },
  })

  if (!dbSession) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session introuvable.',
    })
  }

  if (dbSession.statut !== 'OUVERT') {
    throw createError({
      statusCode: 400,
      statusMessage: "Cette date n'est pas ouverte aux réservations.",
    })
  }

  // Vérifier si l'utilisateur est déjà inscrit
  const existing = await prisma.booking.findFirst({
    where: {
      userId,
      sessionId,
    },
  })

  if (existing) {
    return {
      booking: existing,
      already: true,
      message: 'Tu es déjà inscrit·e sur cette date.',
    }
  }

  // Vérifier les places restantes
  const placesRestantes =
    dbSession.placesTotales - dbSession.placesReservees

  if (placesRestantes <= 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Il n'y a plus de places disponibles pour cette date.",
    })
  }

  // Créer la réservation
  const montant =
    dbSession.prixSpecifique ?? dbSession.aventure.prixParPersonne

  const booking = await prisma.booking.create({
    data: {
      sessionId,
      userId,
      participants: 1,
      montant,
      statut: 'EN_ATTENTE',
    },
  })

  // Incrémenter le nombre de places réservées
  await prisma.aventureSession.update({
    where: { id: sessionId },
    data: {
      placesReservees: {
        increment: 1,
      },
    },
  })

  return {
    booking,
    already: false,
    message: 'Réservation enregistrée 🎉',
  }
})
