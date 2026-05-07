export type SessionHalfDay = 'AM' | 'PM'

export const SESSION_HALF_DAY_OPTIONS: SessionHalfDay[] = ['AM', 'PM']

export const SESSION_HALF_DAY_LABELS: Record<SessionHalfDay, string> = {
  AM: 'matin',
  PM: 'après-midi',
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const SESSION_BOUNDARY_HOURS: Record<'start' | 'end', Record<SessionHalfDay, number>> = {
  start: {
    AM: 8,
    PM: 13,
  },
  end: {
    AM: 12,
    PM: 18,
  },
}

const normalizeNumericValue = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return Math.round(value * 2) / 2
}

const toUtcDayIndexFromParts = (year: number, month: number, day: number) =>
  Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY)

const toUtcDayIndex = (value: Date) =>
  Math.floor(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) / MS_PER_DAY)

const dayIndexToDateInput = (dayIndex: number) => {
  const date = new Date(dayIndex * MS_PER_DAY)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateInputToDayIndex = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return toUtcDayIndexFromParts(year, month, day)
}

const parseDateLike = (value?: string | Date | null) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(+date)) return null
  return date
}

const isMidnightUtc = (value: Date) =>
  value.getUTCHours() === 0
  && value.getUTCMinutes() === 0
  && value.getUTCSeconds() === 0
  && value.getUTCMilliseconds() === 0

export const isHalfDayStep = (value?: number | null) => {
  const normalized = normalizeNumericValue(value)
  if (normalized == null) return false
  return Math.abs(normalized * 2 - Math.round(normalized * 2)) < 1e-9
}

export const formatDurationDays = (value?: number | null) => {
  const normalized = normalizeNumericValue(value)
  if (normalized == null) return ''
  const label = Number.isInteger(normalized)
    ? String(normalized)
    : normalized.toFixed(1).replace('.', ',')
  return `${label} jour${normalized > 1 ? 's' : ''}`
}

export const toDateInputValue = (value?: string | Date | null) => {
  const date = parseDateLike(value)
  if (!date) return ''
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const buildSessionBoundaryDate = (
  dateInput: string,
  halfDay: SessionHalfDay,
  boundary: 'start' | 'end',
) => {
  const [year, month, day] = dateInput.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(Date.UTC(year, month - 1, day, SESSION_BOUNDARY_HOURS[boundary][halfDay], 0, 0, 0))
}

export const getLegacySessionHalfDays = (start?: string | Date | null, end?: string | Date | null) => {
  const startDate = parseDateLike(start)
  const endDate = parseDateLike(end)
  if (!startDate || !endDate) return false
  return isMidnightUtc(startDate) && isMidnightUtc(endDate)
}

export const getSessionHalfDayBounds = (
  start?: string | Date | null,
  end?: string | Date | null,
): { startHalfDay: SessionHalfDay; endHalfDay: SessionHalfDay; legacy: boolean } | null => {
  const startDate = parseDateLike(start)
  if (!startDate) return null
  const endDate = parseDateLike(end ?? start)
  if (!endDate) return null

  if (getLegacySessionHalfDays(startDate, endDate)) {
    return {
      startHalfDay: 'AM',
      endHalfDay: 'PM',
      legacy: true,
    }
  }

  return {
    startHalfDay: startDate.getUTCHours() < 12 ? 'AM' : 'PM',
    endHalfDay: endDate.getUTCHours() <= 12 ? 'AM' : 'PM',
    legacy: false,
  }
}

export const computeSessionEndFromDuration = (
  dateDebutInput: string,
  startHalfDay: SessionHalfDay,
  durationDays?: number | null,
) => {
  const dayIndex = parseDateInputToDayIndex(dateDebutInput)
  const normalizedDuration = normalizeNumericValue(durationDays)
  if (dayIndex == null || normalizedDuration == null || normalizedDuration < 0.5 || !isHalfDayStep(normalizedDuration)) {
    return null
  }

  const halfDaySpan = Math.round(normalizedDuration * 2)
  const startSlotIndex = dayIndex * 2 + (startHalfDay === 'AM' ? 0 : 1)
  const endSlotIndex = startSlotIndex + halfDaySpan - 1
  const endDayIndex = Math.floor(endSlotIndex / 2)
  const endHalfDay: SessionHalfDay = endSlotIndex % 2 === 0 ? 'AM' : 'PM'
  const dateFinInput = dayIndexToDateInput(endDayIndex)

  return {
    dateFinInput,
    endHalfDay,
    dateDebut: buildSessionBoundaryDate(dateDebutInput, startHalfDay, 'start'),
    dateFin: buildSessionBoundaryDate(dateFinInput, endHalfDay, 'end'),
  }
}

export const getSessionDurationDays = (start?: string | Date | null, end?: string | Date | null) => {
  const startDate = parseDateLike(start)
  const endDate = parseDateLike(end)
  if (!startDate || !endDate) return null

  if (getLegacySessionHalfDays(startDate, endDate)) {
    const span = toUtcDayIndex(endDate) - toUtcDayIndex(startDate) + 1
    return span > 0 ? span : null
  }

  const bounds = getSessionHalfDayBounds(startDate, endDate)
  if (!bounds) return null

  const startSlotIndex = toUtcDayIndex(startDate) * 2 + (bounds.startHalfDay === 'AM' ? 0 : 1)
  const endSlotIndex = toUtcDayIndex(endDate) * 2 + (bounds.endHalfDay === 'AM' ? 0 : 1)
  if (endSlotIndex < startSlotIndex) return null
  return (endSlotIndex - startSlotIndex + 1) / 2
}

export const formatSessionRangeLabel = (
  start?: string | Date | null,
  end?: string | Date | null,
  locale = 'fr-FR',
) => {
  const startDate = parseDateLike(start)
  if (!startDate) return ''
  const endDate = parseDateLike(end ?? start)
  if (!endDate) return ''

  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const bounds = getSessionHalfDayBounds(startDate, endDate)
  const startLabel = formatter.format(startDate)
  const endLabel = formatter.format(endDate)

  if (!bounds) return startLabel

  const startIsPartial = bounds.startHalfDay !== 'AM'
  const endIsPartial = bounds.endHalfDay !== 'PM'

  if (startLabel === endLabel) {
    if (!startIsPartial && !endIsPartial) return startLabel
    if (bounds.startHalfDay === bounds.endHalfDay) {
      return `${startLabel} (${SESSION_HALF_DAY_LABELS[bounds.startHalfDay]})`
    }
  }

  const startWithPeriod = `${startLabel}${startIsPartial ? ` (${SESSION_HALF_DAY_LABELS[bounds.startHalfDay]})` : ''}`
  const endWithPeriod = `${endLabel}${endIsPartial ? ` (${SESSION_HALF_DAY_LABELS[bounds.endHalfDay]})` : ''}`
  return startWithPeriod === endWithPeriod ? startWithPeriod : `${startWithPeriod} → ${endWithPeriod}`
}
