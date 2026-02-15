import { prisma } from '../../utils/prisma'

const slugifyName = (firstName?: string | null, lastName?: string | null, fallback?: string | number | null) => {
  const base = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!base) return fallback ? String(fallback) : ''
  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export default defineSitemapEventHandler(async () => {
  const db = await prisma()

  const guides = await db.user.findMany({
    where: { role: 'GUIDE' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      updatedAt: true,
      guideProfile: {
        select: {
          updatedAt: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return guides.map((guide) => {
    const slug = slugifyName(guide.firstName, guide.lastName, guide.id)
    const lastmodDate = guide.guideProfile?.updatedAt || guide.updatedAt
    return {
      loc: `/moniteurs/${slug}`,
      lastmod: lastmodDate.toISOString(),
    }
  })
})
