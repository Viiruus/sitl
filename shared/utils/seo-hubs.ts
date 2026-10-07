import { escaladeDepartments, escaladeDepartmentEntries } from '../data/escalade-departments'
import type { EscaladeDepartmentCode } from '../data/escalade-departments'

const DISCIPLINE_HUBS: Record<string, string> = {
  GRANDE_VOIE: '/disciplines/grande-voie',
}

export const disciplineHubPath = (discipline?: string | null) => {
  if (!discipline) return null
  return DISCIPLINE_HUBS[discipline] ?? null
}

const normalizeArea = (value: string) => value.trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[-–—'’]/g, ' ').replace(/\s+/g, ' ')

const departmentNamePattern = new RegExp(`(?:^|[^a-z0-9])(${escaladeDepartmentEntries
  .map(([, department]) => normalizeArea(department.name)).sort((a, b) => b.length - a.length).join('|')})(?=$|[^a-z0-9])`, 'g')
const namedDepartmentsFor = (location: string) => new Set([...location.matchAll(departmentNamePattern)].map(match => match[1]))

const departmentCodeFor = (department?: string | null) => {
  const value = typeof department === 'string' ? normalizeArea(department) : ''
  if (!value) return null
  const code = value.match(/\b([0-9]{2,3}|2[ab])\b/)?.[1]
  if (code) return code
  return escaladeDepartmentEntries.find(([, department]) => normalizeArea(department.name) === value)?.[0] ?? null
}

export const isSavoieDepartment = (department?: string | null) => departmentCodeFor(department) === '73'
export const isHauteSavoieDepartment = (department?: string | null) => departmentCodeFor(department) === '74'

const localServiceAreas = Object.fromEntries(escaladeDepartmentEntries.map(([code, department]) =>
  [code, new Set([...department.cities, ...department.areas].map(normalizeArea))],
)) as Record<EscaladeDepartmentCode, Set<string>>

const cityPatterns = Object.fromEntries(escaladeDepartmentEntries.map(([code, department]) => [
  code,
  department.cities.map(city => new RegExp(`(?:^|[^a-z0-9])${normalizeArea(city)}(?:$|[^a-z0-9])`)),
])) as Record<EscaladeDepartmentCode, RegExp[]>

const locationMatchesDepartment = (location: unknown, code: EscaladeDepartmentCode) => {
  if (typeof location !== 'string') return false
  const normalized = normalizeArea(location)
  return departmentCodeFor(location) === code || namedDepartmentsFor(normalized).has(normalizeArea(escaladeDepartments[code].name)) ||
    cityPatterns[code].some(pattern => pattern.test(normalized))
}

const baseAreaPatterns = escaladeDepartmentEntries.flatMap(([code, department]) => department.areas.map(area => ({
  code, pattern: new RegExp(`(?:^|[^a-z0-9])${normalizeArea(area)}(?=$|[^a-z0-9])`),
})))

export const guideServesDepartment = (
  guide: { department?: string | null; serviceAreas?: unknown; baseLocation?: string | null },
  departmentCode: EscaladeDepartmentCode,
) => {
  if (departmentCodeFor(guide.department) === departmentCode) return true
  if (locationMatchesDepartment(guide.baseLocation, departmentCode)) return true
  if (typeof guide.baseLocation === 'string') {
    const base = normalizeArea(guide.baseLocation)
    const areaDepartments = new Set(baseAreaPatterns.filter(({ pattern }) => pattern.test(base)).map(({ code }) => code))
    if (areaDepartments.size === 1 && areaDepartments.has(departmentCode)) return true
  }
  if (!Array.isArray(guide.serviceAreas)) return false
  // A shared massif such as the Bauges alone does not imply coverage of both departments.
  return guide.serviceAreas.some(area => typeof area === 'string' && (
    locationMatchesDepartment(area, departmentCode) || localServiceAreas[departmentCode].has(normalizeArea(area))
  ))
}

// A stage's destination is independent of its guide's home department. Prefer
// explicit department names, including labels such as "Bauges (Savoie)".
export const stageIsLocatedInDepartment = (stage: { lieuLabel?: string | null }, code: EscaladeDepartmentCode) => {
  if (typeof stage.lieuLabel !== 'string') return false
  const location = normalizeArea(stage.lieuLabel)
  if (/\bou\b|\bailleurs\b/.test(location)) return false
  const namedDepartments = namedDepartmentsFor(location)
  if (namedDepartments.size) return namedDepartments.size === 1 && namedDepartments.has(normalizeArea(escaladeDepartments[code].name))
  return locationMatchesDepartment(stage.lieuLabel, code) || localServiceAreas[code].has(location)
}

export const departmentHubPath = (department?: string | null) => {
  const code = departmentCodeFor(department)
  if (!code || !(code in escaladeDepartments)) return null
  return `/escalade/${escaladeDepartments[code as EscaladeDepartmentCode].slug}`
}
