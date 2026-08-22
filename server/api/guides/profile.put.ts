import { z } from 'zod'
import { prisma } from '../../utils/prisma'

const imageUrlSchema = z.union([
  z.string().trim().url(),
  z.string().trim().startsWith('/uploads/'),
  z.string().trim().startsWith('/api/moniteurs/uploads/'),
])

const imageVariantSchema = z.object({
  url: imageUrlSchema,
  width: z.number().int().min(1),
  size: z.number().int().min(0).optional(),
})

const bodySchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  phoneNumber: z.string().trim().min(6, 'Ajoute un numéro de téléphone').max(30),
  whatsappOptIn: z.boolean().optional(),
  gender: z.enum(['male', 'female']).optional().nullable().or(z.literal('')),
  baseLocation: z.string().trim().max(160).optional().or(z.literal('')),
  serviceAreas: z.array(z.string().trim().max(120)).max(30).optional(),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  stageTermsAndConditions: z.string().trim().max(20000).optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  googleBusinessUrl: z.string().url().optional().or(z.literal('')),
  googlePlaceId: z.string().trim().max(255).optional().or(z.literal('')),
  professionalCardNumber: z.string().trim().max(100).optional().or(z.literal('')),
  profileImageUrl: z.union([
    imageUrlSchema,
    z.string().trim().startsWith('data:'),
    z.literal(''),
  ]).optional(),
  profileImageVariants: z.array(imageVariantSchema).max(16).optional(),
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
  const cleanVariants = (variants?: { url: string; width: number; size?: number }[] | null) => {
    if (variants === undefined) return undefined
    if (!variants || variants.length === 0) return null
    const normalized = variants
      .map((variant) => ({
        url: variant.url.trim(),
        width: variant.width,
        ...(variant.size != null ? { size: variant.size } : {}),
      }))
      .filter((variant) => variant.url && variant.width > 0)
    return normalized.length ? normalized : null
  }
  const cleanStringList = (values?: string[] | null) => {
    if (values === undefined) return undefined
    const normalized = (values || [])
      .map((value) => value.trim())
      .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index)
    return normalized.length ? normalized : null
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
            gender: body.gender === '' ? null : (body.gender ?? undefined),
            bio: clean(body.bio),
            stageTermsAndConditions: clean(body.stageTermsAndConditions),
            baseLocation: clean(body.baseLocation),
            serviceAreas: cleanStringList(body.serviceAreas),
            instagramUrl: clean(body.instagramUrl),
            googleBusinessUrl: clean(body.googleBusinessUrl),
            googlePlaceId: clean(body.googlePlaceId),
            professionalCardNumber: clean(body.professionalCardNumber),
            profileImageUrl: clean(body.profileImageUrl),
            profileImageVariants: cleanVariants(body.profileImageVariants),
          },
          create: {
            gender: body.gender === '' ? null : (body.gender ?? null),
            bio: clean(body.bio) ?? '',
            stageTermsAndConditions: clean(body.stageTermsAndConditions) ?? null,
            baseLocation: clean(body.baseLocation) ?? null,
            serviceAreas: cleanStringList(body.serviceAreas) ?? null,
            instagramUrl: clean(body.instagramUrl) ?? null,
            googleBusinessUrl: clean(body.googleBusinessUrl) ?? null,
            googlePlaceId: clean(body.googlePlaceId) ?? null,
            professionalCardNumber: clean(body.professionalCardNumber) ?? null,
            profileImageUrl: clean(body.profileImageUrl) ?? null,
            profileImageVariants: cleanVariants(body.profileImageVariants) ?? null,
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
      isAdmin: user.isAdmin,
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
      gender: user.guideProfile?.gender || null,
      baseLocation: user.guideProfile?.baseLocation || null,
      serviceAreas: Array.isArray(user.guideProfile?.serviceAreas)
        ? user.guideProfile.serviceAreas.filter((value: unknown) => typeof value === 'string' && value.trim().length > 0)
        : [],
      bio: user.guideProfile?.bio || null,
      stageTermsAndConditions: user.guideProfile?.stageTermsAndConditions || null,
      instagramUrl: user.guideProfile?.instagramUrl || null,
      googleBusinessUrl: user.guideProfile?.googleBusinessUrl || null,
      googlePlaceId: user.guideProfile?.googlePlaceId || null,
      professionalCardNumber: user.guideProfile?.professionalCardNumber || null,
      profileImageUrl: user.guideProfile?.profileImageUrl || null,
      profileImageVariants: user.guideProfile?.profileImageVariants || null,
    },
  }
})
