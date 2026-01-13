import { z } from 'zod'
import { prisma } from '../../utils/prisma'

const bodySchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  phoneNumber: z.string().trim().min(6, 'Ajoute un numéro de téléphone').max(30),
  whatsappOptIn: z.boolean().optional(),
  baseLocation: z.string().trim().max(160).optional().or(z.literal('')),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  professionalCardNumber: z.string().trim().max(100).optional().or(z.literal('')),
  profileImageUrl: z.union([
    z.string().trim().url(),
    z.string().trim().startsWith('/uploads/'),
    z.string().trim().startsWith('/api/moniteurs/uploads/'),
    z.string().trim().startsWith('data:'),
    z.literal(''),
  ]).optional(),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  const body = bodySchema.parse(await readBody(event))
  const db = await prisma()
  const clean = (value?: string | null) => {
    if (value === undefined) return undefined
    const trimmed = value?.trim()
    return trimmed ? trimmed : null
  }

  const user = await db.user.update({
    where: { id: Number(session.user.id) },
    data: {
      ...(body.firstName !== undefined
        ? { firstName: body.firstName || null }
        : {}),
      ...(body.lastName !== undefined
        ? { lastName: body.lastName || null }
        : {}),
      phoneNumber: body.phoneNumber.trim(),
      ...(body.whatsappOptIn !== undefined
        ? { whatsappOptIn: body.whatsappOptIn }
        : {}),
      guideProfile: {
        upsert: {
          update: {
            bio: clean(body.bio),
            baseLocation: clean(body.baseLocation),
            instagramUrl: clean(body.instagramUrl),
            websiteUrl: clean(body.websiteUrl),
            professionalCardNumber: clean(body.professionalCardNumber),
            profileImageUrl: clean(body.profileImageUrl),
          },
          create: {
            bio: clean(body.bio) ?? '',
            baseLocation: clean(body.baseLocation) ?? null,
            instagramUrl: clean(body.instagramUrl) ?? null,
            websiteUrl: clean(body.websiteUrl) ?? null,
            professionalCardNumber: clean(body.professionalCardNumber) ?? null,
            profileImageUrl: clean(body.profileImageUrl) ?? null,
            isPublic: true,
          },
        },
      },
    },
    include: { guideProfile: true },
  })

  await setUserSession(event, {
    user: {
      ...session.user,
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      onboarded: user.onboarded,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    },
  })

  return {
    guide: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
      baseLocation: user.guideProfile?.baseLocation || null,
      bio: user.guideProfile?.bio || null,
      instagramUrl: user.guideProfile?.instagramUrl || null,
      websiteUrl: user.guideProfile?.websiteUrl || null,
      professionalCardNumber: user.guideProfile?.professionalCardNumber || null,
      profileImageUrl: user.guideProfile?.profileImageUrl || null,
    },
  }
})
