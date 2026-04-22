const DISCIPLINE_HUBS: Record<string, string> = {
  GRANDE_VOIE: '/disciplines/grande-voie',
}

export const disciplineHubPath = (discipline?: string | null) => {
  if (!discipline) return null
  return DISCIPLINE_HUBS[discipline] ?? null
}

export const isSavoieDepartment = (department?: string | null) => {
  const value = typeof department === 'string' ? department.trim().toLowerCase() : ''
  if (!value) return false
  return value.includes('73') || value.includes('savoie')
}

export const departmentHubPath = (department?: string | null) => {
  if (isSavoieDepartment(department)) {
    return '/departements/savoie'
  }
  return null
}

