import { escaladeDepartments } from '~~/shared/data/escalade-departments'
import type { EscaladeDepartmentCode } from '~~/shared/data/escalade-departments'
import type { DepartmentOutline } from '~~/shared/utils/stage-department'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code') ?? ''
  if (!Object.hasOwn(escaladeDepartments, code)) throw createError({ statusCode: 404 })
  const department = escaladeDepartments[code as EscaladeDepartmentCode]
  // Nitro embeds the existing map files so SSR can read the same boundaries
  // without an HTTP request to the site's own public assets.
  const outline = await useStorage('assets:department-maps').getItem<DepartmentOutline>(`${department.slug}.geojson`)
  if (!outline) throw createError({ statusCode: 500, statusMessage: 'Contour du département indisponible' })
  setHeader(event, 'cache-control', 'public, max-age=86400')
  return outline
})
