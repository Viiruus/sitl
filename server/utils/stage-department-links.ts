import { escaladeDepartmentEntries } from '~~/shared/data/escalade-departments'
import { hasMapCoordinates } from '~~/shared/utils/department-map'
import { stageIsLocatedInDepartment } from '~~/shared/utils/seo-hubs'
import { distanceToDepartmentKm } from '~~/shared/utils/stage-department'
import type { DepartmentOutline, DepartmentStageSource } from '~~/shared/utils/stage-department'

export const resolveStageDepartmentLinks = async (stage: DepartmentStageSource) => {
  const locations = typeof stage.lieuLabel === 'string'
    ? stage.lieuLabel.split(/[,;/]|\s+ou\s+|\s+et\s+/i)
    : []

  const links = await Promise.all(escaladeDepartmentEntries.map(async ([code, department]) => {
    let matches = false
    if (hasMapCoordinates(stage)) {
      const storedOutline = await useStorage('assets:department-maps').getItem<DepartmentOutline | string | Uint8Array>(`${department.slug}.geojson`)
      // Nitro bundles GeoJSON as bytes in production; dev storage may have
      // already decoded the file. Accept both forms of the same boundary.
      const rawOutline = storedOutline instanceof Uint8Array ? new TextDecoder().decode(storedOutline) : storedOutline
      const outline = typeof rawOutline === 'string' ? JSON.parse(rawOutline) as DepartmentOutline : rawOutline
      matches = Boolean(outline && distanceToDepartmentKm([stage.longitude, stage.latitude], outline) < 0.000001)
    } else {
      // Several proposed destinations can link to their hubs without adding
      // an undecided stage to those hubs' geographically filtered listings.
      matches = locations.some(lieuLabel => stageIsLocatedInDepartment({ lieuLabel }, code))
    }
    return matches ? {
      code,
      label: `Escalade ${department.location}`,
      path: `/escalade/${department.slug}`,
    } : null
  }))

  return links.filter(link => link !== null).sort((a, b) =>
    locations.findIndex(lieuLabel => stageIsLocatedInDepartment({ lieuLabel }, a.code)) -
    locations.findIndex(lieuLabel => stageIsLocatedInDepartment({ lieuLabel }, b.code)),
  )
}
