import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3'

// TSX_TSCONFIG_PATH=.nuxt/tsconfig.server.json node --import tsx --test tests/salon-escalade-bookings.test.ts
// Base temporaire indépendante : aucun accès à la base du site ni envoi de notification.
const directory = mkdtempSync(join(tmpdir(), 'bdk-salon-bookings-'))
let db: any
let adminApi: (event: any) => Promise<any>
let guideApi: (event: any) => Promise<any>
let currentUser: any

before(async () => {
  for (const key of ['VERCEL', 'VERCEL_ENV', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'LIBSQL_URL', 'LIBSQL_AUTH_TOKEN']) delete process.env[key]
  const databasePath = join(directory, 'test.db')
  process.env.DATABASE_URL = `file:${databasePath}`
  const sqlite = new Database(databasePath)
  sqlite.exec(`
    CREATE TABLE User (id INTEGER PRIMARY KEY, email TEXT, role TEXT, isAdmin BOOLEAN, firstName TEXT, lastName TEXT, phoneNumber TEXT, whatsappOptIn BOOLEAN);
    INSERT INTO User VALUES (1, 'admin@example.com', 'GUIDE', 1, 'Alex', 'Martin', NULL, 0);
    INSERT INTO User VALUES (2, 'guide@example.com', 'GUIDE', 0, 'Camille', 'Durand', NULL, 0);
    INSERT INTO User VALUES (3, 'climber@example.com', 'CLIMBER', 0, 'Léa', 'Petit', NULL, 0);
    CREATE TABLE Aventure (id INTEGER PRIMARY KEY, guideId INTEGER, titre TEXT, slug TEXT, jours REAL);
    INSERT INTO Aventure VALUES (1, 1, 'Stage falaise', 'stage-falaise', 2), (2, 2, 'Autre stage', 'autre-stage', 2);
    CREATE TABLE AventureSession (id INTEGER PRIMARY KEY, aventureId INTEGER, dateDebut DATETIME, dateFin DATETIME, statut TEXT, placesTotales INTEGER, placesReservees INTEGER, prixSpecifique INTEGER, createdAt DATETIME, updatedAt DATETIME);
    INSERT INTO AventureSession VALUES (1, 1, '2027-06-01T08:00:00Z', '2027-06-02T17:00:00Z', 'OUVERT', 8, 4, NULL, '2026-11-01T12:00:00Z', '2026-11-01T12:00:00Z');
    INSERT INTO AventureSession SELECT 2, 2, dateDebut, dateFin, statut, placesTotales, 1, prixSpecifique, createdAt, updatedAt FROM AventureSession WHERE id = 1;
    CREATE TABLE Booking (id INTEGER PRIMARY KEY, sessionId INTEGER, userId INTEGER, statut TEXT, participants INTEGER, montant INTEGER, createdAt DATETIME, updatedAt DATETIME);
    INSERT INTO Booking VALUES
      (1, 1, 3, 'CONFIRMEE', 1, 200, '2026-11-06T12:00:00Z', '2027-01-16T12:00:00Z'),
      (2, 1, 3, 'EN_ATTENTE', 1, 200, '2027-01-14T23:00:00Z', '2027-01-14T23:00:00Z'),
      (3, 1, 3, 'CONFIRMEE', 1, 200, '2027-01-17T22:59:59.999Z', '2027-01-20T12:00:00Z'),
      (4, 1, 3, 'EN_ATTENTE', 1, 200, '2027-01-17T23:00:00Z', '2027-01-17T23:00:00Z'),
      (5, 2, 3, 'EN_ATTENTE', 1, 300, '2027-01-16T12:00:00Z', '2027-01-16T12:00:00Z');
  `)
  sqlite.close()
  Object.assign(globalThis, {
    defineEventHandler: (handler: any) => handler,
    getUserSession: async () => currentUser ? { user: currentUser } : null,
    getQuery: (event: any) => event.query || {},
    createError: (options: any) => Object.assign(new Error(options.statusMessage), options),
  })
  db = await (await import('../server/utils/prisma')).prisma()
  adminApi = (await import('../server/api/admin/bookings/index.get')).default as any
  guideApi = (await import('../server/api/guides/aventures/[slug]/bookings.get')).default as any
})

after(async () => {
  await db?.$disconnect()
  rmSync(directory, { recursive: true, force: true })
})

test('administration : remise attachée à chaque inscription éligible, sans modifier le montant', async () => {
  currentUser = { id: 1, role: 'GUIDE' }
  const result = await adminApi({})
  assert.deepEqual(result.bookings.filter((b: any) => b.salonOffer).map((b: any) => b.id).sort(), [2, 3, 5])
  assert.equal(result.bookings.find((b: any) => b.id === 2).salonOffer.discountPercent, 20)
  assert.equal(result.bookings.find((b: any) => b.id === 2).montant, 200)
  assert.equal(result.bookings.find((b: any) => b.id === 1).salonOffer, null)
  assert.equal((await adminApi({ query: { sessionId: 1 } })).bookings.length, 4)
})

test('moniteur : seules ses réservations sont visibles et la remise reste affichée après le Salon', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2028-01-01T12:00:00Z') })
  currentUser = { id: 1, role: 'GUIDE' }
  const result = await guideApi({ context: { params: { slug: 'stage-falaise' } } })
  assert.equal(result.bookings.length, 4)
  assert.deepEqual(result.bookings.filter((b: any) => b.salonOffer).map((b: any) => b.id).sort(), [2, 3])
  await assert.rejects(() => guideApi({ context: { params: { slug: 'autre-stage' } } }), (e: any) => e.statusCode === 404)
})

test('les informations de réservation restent protégées par les droits existants', async () => {
  currentUser = null
  await assert.rejects(() => adminApi({}), (e: any) => e.statusCode === 401)
  await assert.rejects(() => guideApi({ context: { params: { slug: 'stage-falaise' } } }), (e: any) => e.statusCode === 401)
  currentUser = { id: 2, role: 'GUIDE', isAdmin: true }
  await assert.rejects(() => adminApi({}), (e: any) => e.statusCode === 403)
})
