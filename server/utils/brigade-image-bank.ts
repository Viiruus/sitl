import { z } from 'zod'
import { brigadeFolderNameKey, normalizeBrigadeFolderName, type BrigadeBankImage } from '~~/shared/utils/brigade-image-bank'
import { verifyBrigadeUploads } from './brigade-image-uploads'
import { sanitizePublicImageVariants } from './public-image'

export const shareBrigadeImageSchema = z.object({
  url: z.string().trim().min(1).max(2048),
  variants: z.array(z.object({
    url: z.string().trim().min(1).max(2048),
    width: z.number().int().positive().max(10000),
    size: z.number().int().nonnegative().optional(),
  })).max(6).default([]),
  alt: z.string().trim().max(300).default(''),
  folderId: z.number().int().positive().optional(),
  folderName: z.string().transform(normalizeBrigadeFolderName).pipe(z.string().min(2).max(100))
    .refine(name => brigadeFolderNameKey(name).length >= 2, 'Nom de dossier invalide').optional(),
}).refine(input => Boolean(input.folderId) !== Boolean(input.folderName), 'Choisis un dossier existant ou un nouveau dossier.')

export const brigadeImageQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  folderId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(100).default(''),
})

const imageSelect = {
  id: true, url: true, alt: true, variants: true, credit: true,
  folder: { select: { id: true, name: true } },
}

function mapImage(image: any): BrigadeBankImage {
  return {
    id: image.id, url: image.url, alt: image.alt, credit: image.credit,
    variants: sanitizePublicImageVariants(image.variants) || [],
    folder: { id: image.folder.id, name: image.folder.name },
  }
}

export async function listBrigadeImageFolders(db: any) {
  const folders = await db.brigadeImageFolder.findMany({
    orderBy: [{ nameKey: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true, _count: { select: { images: true } } },
  })
  return { folders: folders.map((folder: any) => ({ id: folder.id, name: folder.name, imageCount: folder._count.images })) as { id: number; name: string; imageCount: number }[] }
}

export async function listBrigadeImages(db: any, query: z.infer<typeof brigadeImageQuerySchema>) {
  const where = {
    ...(query.folderId ? { folderId: query.folderId } : {}),
    ...(query.search ? { OR: [
      { alt: { contains: query.search } },
      { folder: { nameKey: { contains: brigadeFolderNameKey(query.search) } } },
    ] } : {}),
  }
  const pageSize = 24
  const total = await db.brigadeImage.count({ where })
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(query.page, pageCount)
  const images = await db.brigadeImage.findMany({
    where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: pageSize, skip: (page - 1) * pageSize, select: imageSelect,
  })
  return { images: images.map(mapImage), total, page, pageCount }
}

export async function shareBrigadeImage(
  db: any,
  guide: { id: number; firstName?: string | null; lastName?: string | null },
  input: z.infer<typeof shareBrigadeImageSchema>,
  verify = verifyBrigadeUploads,
) {
  await verify(guide.id, [input.url, ...input.variants.map(variant => variant.url)])
  return db.$transaction(async (tx: any) => {
    const existing = await tx.brigadeImage.findUnique({ where: { url: input.url }, include: { folder: true } })
    if (existing) {
      const sameFolder = input.folderId ? existing.folderId === input.folderId : existing.folder.nameKey === brigadeFolderNameKey(input.folderName!)
      if (!sameFolder) throw createError({ statusCode: 409, statusMessage: `Cette image est déjà partagée dans le dossier « ${existing.folder.name} ».` })
      return { image: mapImage(existing), alreadyShared: true }
    }
    const folder = input.folderId
      ? await tx.brigadeImageFolder.findUnique({ where: { id: input.folderId } })
      : await tx.brigadeImageFolder.upsert({
          where: { nameKey: brigadeFolderNameKey(input.folderName!) },
          create: { name: input.folderName!, nameKey: brigadeFolderNameKey(input.folderName!), createdById: guide.id },
          update: {},
        })
    if (!folder) throw createError({ statusCode: 404, statusMessage: 'Ce dossier n’existe plus. Choisis un autre dossier.' })
    const image = await tx.brigadeImage.create({
      data: {
        folderId: folder.id, uploadedById: guide.id,
        credit: [guide.firstName, guide.lastName].filter(Boolean).join(' ') || 'Un·e moniteur·ice de la Brigade',
        url: input.url, alt: input.alt, variants: input.variants,
      },
      select: imageSelect,
    })
    return { image: mapImage(image), alreadyShared: false }
  })
}
