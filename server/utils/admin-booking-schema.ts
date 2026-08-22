import { z } from 'zod'

export const adminBookingSchema = z.object({
  sessionId: z.number().int().positive(),
  userId: z.number().int().positive(),
  statut: z.enum(['EN_ATTENTE', 'CONFIRMEE', 'ANNULEE']).default('EN_ATTENTE'),
  participants: z.number().int().min(1).max(100),
  montant: z.number().int().min(0),
})

