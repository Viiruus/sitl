export const buildGuideSlug = (
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | number | null,
) => {
  const base = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!base) return fallback ? String(fallback) : ''
  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
