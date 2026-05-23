import { prisma } from "../utils/prisma"
import { getGuideSitemapUrls, getStageSitemapUrls } from "../utils/sitemap-urls"

const GUIDE_SOURCE_PATH = "/api/__sitemap__/moniteurs"
const STAGE_SOURCE_PATH = "/api/__sitemap__/stages"

function getSourcePath(source: any): string | null {
  const fetchTarget = typeof source === "string" ? source : Array.isArray(source) ? source[0] : source?.fetch
  const url = Array.isArray(fetchTarget) ? fetchTarget[0] : fetchTarget

  if (typeof url !== "string") return null
  if (url.startsWith("/")) return url

  try {
    return new URL(url).pathname
  } catch {
    return null
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("sitemap:sources", async (ctx) => {
    const sourcePaths = ctx.sources.map(getSourcePath)
    const needsGuides = sourcePaths.includes(GUIDE_SOURCE_PATH)
    const needsStages = sourcePaths.includes(STAGE_SOURCE_PATH)

    if (!needsGuides && !needsStages) return

    const db = await prisma()
    const [guideUrls, stageUrls] = await Promise.all([
      needsGuides ? getGuideSitemapUrls(db) : Promise.resolve(null),
      needsStages ? getStageSitemapUrls(db) : Promise.resolve(null),
    ])

    ctx.sources = ctx.sources.map((source, index) => {
      const sourcePath = sourcePaths[index]

      if (sourcePath === GUIDE_SOURCE_PATH && guideUrls) {
        return {
          context: {
            name: "bdk:sitemap:moniteurs",
            description: "Generated directly from Prisma to avoid production self-fetch timeouts.",
          },
          sourceType: "user",
          urls: guideUrls,
        }
      }

      if (sourcePath === STAGE_SOURCE_PATH && stageUrls) {
        return {
          context: {
            name: "bdk:sitemap:stages",
            description: "Generated directly from Prisma to avoid production self-fetch timeouts.",
          },
          sourceType: "user",
          urls: stageUrls,
        }
      }

      return source
    })
  })
})
