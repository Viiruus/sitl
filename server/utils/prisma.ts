// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import process from 'process'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Tu peux récupérer le chemin à partir de DATABASE_URL si tu veux,
// mais pour ton cas simple, on pointe directement sur le fichier :

//const db = new Database('prisma/dev.db') // correspond à DATABASE_URL="file:./prisma/dev.db"
//const adapter = new PrismaBetterSqlite(db)

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // ⬅️ obligatoire en Prisma 7
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
