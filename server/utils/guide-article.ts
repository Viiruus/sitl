import { z } from 'zod'
import type { H3Event } from 'h3'
import { isManagedGuideImageUrl } from '~~/shared/constants/guide-image-upload'
import { markdownContainsText } from '~~/shared/utils/article-content'

const imageVariantSchema = z.object({
  url: z.string().trim().refine(isManagedGuideImageUrl, 'URL d’image invalide.'),
  width: z.number().int().positive(),
  size: z.number().int().positive().optional(),
})

export const articlePayloadSchema = z.object({
  title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères.').max(180),
  coverImageUrl: z.string().trim().refine(isManagedGuideImageUrl, 'Ajoute une photo d’en-tête.'),
  coverImageVariants: z.array(imageVariantSchema).max(10).optional().nullable(),
  content: z.string().trim().min(1).max(200_000).refine(markdownContainsText, 'Écris du contenu texte dans ton article.'),
})

export const articleStatusSchema = z.object({
  isPublished: z.boolean(),
})

export async function requireGuide(event: H3Event) {
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  if (session.user.role !== 'GUIDE') {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé aux moniteurs' })
  }

  return {
    session,
    guideId: Number(session.user.id),
  }
}

export function readArticleId(event: H3Event) {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Article invalide' })
  }
  return id
}

export function articleSlugBase(title: string) {
  return title
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'article'
}

export async function createUniqueArticleSlug(db: any, title: string) {
  const base = articleSlugBase(title)
  let slug = base
  let suffix = 2

  while (await db.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`
    suffix += 1
  }

  return slug
}
