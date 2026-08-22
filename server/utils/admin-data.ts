export const cleanOptionalString = (value: unknown) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

export const cleanStringList = (value: unknown) => {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) return null
  const normalized = value
    .map((entry) => String(entry).trim())
    .filter((entry, index, values) => entry && values.indexOf(entry) === index)
  return normalized.length ? normalized : null
}

export const recalculateSessionPlaces = async (db: any, sessionIds: number[]) => {
  const uniqueIds = [...new Set(sessionIds.filter((id) => Number.isInteger(id) && id > 0))]
  for (const sessionId of uniqueIds) {
    const aggregate = await db.booking.aggregate({
      where: { sessionId, statut: { not: 'ANNULEE' } },
      _sum: { participants: true },
    })
    await db.aventureSession.updateMany({
      where: { id: sessionId },
      data: { placesReservees: aggregate._sum.participants ?? 0 },
    })
  }
}

export const deleteStageCascade = async (db: any, aventureId: number) => {
  const sessions = await db.aventureSession.findMany({
    where: { aventureId },
    select: { id: true },
  })
  const sessionIds = sessions.map((session: { id: number }) => session.id)

  if (sessionIds.length) {
    await db.booking.deleteMany({ where: { sessionId: { in: sessionIds } } })
    await db.aventureSession.deleteMany({ where: { id: { in: sessionIds } } })
  }
  await db.aventure.delete({ where: { id: aventureId } })
}

