import { buildGuideSlug } from "~~/shared/utils/guide-slug"
import { getPublicFutureSessionThreshold } from "~~/shared/utils/public-stage-sessions"
import { sanitizePublicImageUrl } from "./public-image"

type SitemapUrl = {
  loc: string
  lastmod: string
  changefreq: "weekly"
  priority: 0.7 | 0.8 | 0.9
}

export function getStaticSitemapUrls(): SitemapUrl[] {
  const lastmod = new Date().toISOString()

  return [
    {
      loc: "/",
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: "/stages-escalade",
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: "/la-brigade",
      lastmod,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: "/disciplines/grande-voie",
      lastmod,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: "/departements/savoie",
      lastmod,
      changefreq: "weekly",
      priority: 0.8,
    },
  ]
}

export async function getGuideSitemapUrls(db: any): Promise<SitemapUrl[]> {
  const guides = await db.user.findMany({
    where: { role: "GUIDE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      department: true,
      updatedAt: true,
      guideProfile: {
        select: {
          profileImageUrl: true,
          bio: true,
          baseLocation: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  })

  return guides
    .filter((guide: any) => {
      const firstName = guide.firstName?.trim() || ""
      const lastName = guide.lastName?.trim() || ""
      const profileImageUrl = sanitizePublicImageUrl(guide.guideProfile?.profileImageUrl, { allowInline: true })
      const bio = guide.guideProfile?.bio?.trim() || ""
      const baseLocation = guide.guideProfile?.baseLocation?.trim() || guide.department?.trim() || ""

      return Boolean(firstName && lastName && profileImageUrl && bio && baseLocation)
    })
    .map((guide: any) => {
      const slug = buildGuideSlug(guide.firstName, guide.lastName, guide.id)
      const lastmodDate = guide.guideProfile?.updatedAt || guide.updatedAt
      return {
        loc: `/moniteurs/${slug}`,
        lastmod: lastmodDate.toISOString(),
        changefreq: "weekly",
        priority: 0.7,
      }
    })
}

export async function getStageSitemapUrls(db: any): Promise<SitemapUrl[]> {
  const publicFutureThreshold = getPublicFutureSessionThreshold()

  const stages = await db.aventure.findMany({
    where: {
      estPublie: true,
      sessions: {
        some: {
          dateDebut: { gte: publicFutureThreshold },
        },
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return stages
    .filter((stage: any) => Boolean(stage.slug))
    .map((stage: any) => ({
      loc: `/stages-escalade/${stage.slug}`,
      lastmod: stage.updatedAt.toISOString(),
      changefreq: "weekly",
      priority: 0.8,
    }))
}
