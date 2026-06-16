export const getPublicFutureSessionThreshold = (now = new Date()) => {
  const threshold = new Date(now)
  threshold.setHours(0, 0, 0, 0)
  threshold.setDate(threshold.getDate() + 1)
  return threshold
}

export const getPublicFutureSessionThresholdMs = (now = new Date()) =>
  getPublicFutureSessionThreshold(now).getTime()

export const isPublicFutureSession = (
  session?: { dateDebut?: string | Date | null } | null,
  thresholdMs = getPublicFutureSessionThresholdMs(),
) => {
  if (!session?.dateDebut) return false
  const timestamp = new Date(session.dateDebut).getTime()
  return !Number.isNaN(timestamp) && timestamp >= thresholdMs
}
