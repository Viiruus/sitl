import { z } from 'zod'

const isoDate = z.string().trim().refine((value) => Number.isFinite(Date.parse(value)), 'Date invalide')

export const adminSessionSchema = z.object({
  aventureId: z.number().int().positive(),
  dateDebut: isoDate,
  dateFin: isoDate,
  statut: z.enum(['BROUILLON', 'OUVERT', 'COMPLET', 'ANNULE']).default('OUVERT'),
  placesTotales: z.number().int().min(0).max(1000),
  prixSpecifique: z.number().int().min(0).optional().nullable(),
})

