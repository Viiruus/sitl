import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { brigadeFolderNameKey } from '../shared/utils/brigade-image-bank'

// TSX_TSCONFIG_PATH=.nuxt/tsconfig.server.json node --import tsx --test tests/brigade-image-bank.test.ts
const directory = mkdtempSync(join(tmpdir(), 'bdk-image-bank-'))
let db: any
let bank: typeof import('../server/utils/brigade-image-bank')
let uploads: typeof import('../server/utils/brigade-image-uploads')
let foldersAPI: (event: any) => Promise<any>
let imagesAPI: (event: any) => Promise<any>
let shareAPI: (event: any) => Promise<any>
let user: any = null
const guide = { id: 1, firstName: 'Camille', lastName: 'Martin' }
const imageUrl = (id = 1, owner = 1) => `/uploads/moniteurs/${owner}-00000000-0000-4000-8000-${String(id).padStart(12, '0')}.webp`
const variantUrl = (id = 1, owner = 1) => imageUrl(id, owner).replace('.webp', '-640w.webp')
const verify = async (guideId: number, urls: string[]) => {
  for (const url of urls) if (!uploads.ownedBrigadeUploadPath(url, guideId)) throw Object.assign(new Error('Non autorisé'), { statusCode: 403 })
}

before(async () => {
  for (const key of ['VERCEL', 'VERCEL_ENV', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'LIBSQL_URL', 'LIBSQL_AUTH_TOKEN', 'BLOB_READ_WRITE_TOKEN']) delete process.env[key]
  const databasePath = join(directory, 'test.db')
  process.env.DATABASE_URL = `file:${databasePath}`
  const sqlite = new Database(databasePath)
  sqlite.exec(`
    CREATE TABLE User (id INTEGER PRIMARY KEY, role TEXT, onboarded BOOLEAN, firstName TEXT, lastName TEXT);
    INSERT INTO User VALUES (1, 'GUIDE', 1, 'Camille', 'Martin');
    INSERT INTO User VALUES (2, 'GUIDE', 1, 'Alex', 'Durand');
    INSERT INTO User VALUES (3, 'CLIMBER', 1, 'Léa', 'Petit');
  `)
  sqlite.exec(readFileSync(new URL('../prisma/migrations/20261102160000_add_brigade_image_bank/migration.sql', import.meta.url), 'utf8'))
  sqlite.close()
  Object.assign(globalThis, {
    defineEventHandler: (handler: any) => handler,
    getUserSession: async () => user ? { user } : null,
    getQuery: (event: any) => event.query || {},
    readBody: async (event: any) => event.body,
    setResponseHeader: () => {},
    createError: (options: any) => Object.assign(new Error(options.statusMessage), options),
  })
  bank = await import('../server/utils/brigade-image-bank')
  uploads = await import('../server/utils/brigade-image-uploads')
  db = await (await import('../server/utils/prisma')).prisma()
  foldersAPI = (await import('../server/api/guides/image-bank/folders.get')).default as any
  imagesAPI = (await import('../server/api/guides/image-bank/images.get')).default as any
  shareAPI = (await import('../server/api/guides/image-bank/images.post')).default as any
})

beforeEach(async () => {
  await db.brigadeImage.deleteMany()
  await db.brigadeImageFolder.deleteMany()
  user = { id: 1, role: 'GUIDE', onboarded: true }
})

after(async () => {
  const state = (globalThis as any).__bdkPrismaState
  if (state?.promise) await (await state.promise).$disconnect()
  await db?.$disconnect()
  rmSync(directory, { recursive: true, force: true })
})

test('a shared upload keeps its variants, description and contributor without copying its file', async () => {
  const input = bank.shareBrigadeImageSchema.parse({
    url: imageUrl(), variants: [{ url: variantUrl(), width: 640 }], alt: 'Une cordée dans les dalles', folderName: '  Les   Gaillands  ',
  })
  const { image } = await bank.shareBrigadeImage(db, guide, input, verify)
  assert.equal(image.url, input.url)
  assert.deepEqual(image.variants, input.variants)
  assert.equal(image.alt, input.alt)
  assert.equal(image.credit, 'Camille Martin')
  assert.equal(image.folder.name, 'Les Gaillands')
  user = { id: 2, role: 'GUIDE', onboarded: true }
  assert.equal((await imagesAPI({})).images[0].id, image.id)
  assert.deepEqual((await foldersAPI({})).folders, [{ id: image.folder.id, name: 'Les Gaillands', imageCount: 1 }])
})

test('folder names are normalized and reused across contributors', async () => {
  const first = await bank.shareBrigadeImage(db, guide, bank.shareBrigadeImageSchema.parse({ url: imageUrl(), folderName: '  Céüse  ' }), verify)
  const second = await bank.shareBrigadeImage(db, { id: 2, firstName: 'Alex' }, bank.shareBrigadeImageSchema.parse({ url: imageUrl(2, 2), folderName: 'CEUSE' }), verify)
  assert.equal(first.image.folder.id, second.image.folder.id)
  const third = await bank.shareBrigadeImage(db, guide, bank.shareBrigadeImageSchema.parse({ url: imageUrl(3), folderId: first.image.folder.id }), verify)
  assert.equal(third.image.folder.id, first.image.folder.id)
  assert.equal(await db.brigadeImageFolder.count(), 1)
  assert.equal(brigadeFolderNameKey('L’  Argentière'), brigadeFolderNameKey("l'argentiere"))
})

test('repeating a share is idempotent and cannot silently move an existing image', async () => {
  const input = bank.shareBrigadeImageSchema.parse({ url: imageUrl(), folderName: 'Verdon' })
  await bank.shareBrigadeImage(db, guide, input, verify)
  assert.equal((await bank.shareBrigadeImage(db, guide, input, verify)).alreadyShared, true)
  await assert.rejects(() => bank.shareBrigadeImage(db, guide, { ...input, folderName: 'Vercors' }, verify), (error: any) => error.statusCode === 409)
  assert.equal(await db.brigadeImage.count(), 1)
  assert.equal(await db.brigadeImageFolder.count(), 1)
})

test('sharing into an unknown folder or with an unowned upload leaves no orphan folders', async () => {
  const input = bank.shareBrigadeImageSchema.parse({ url: imageUrl(), folderId: 99999 })
  await assert.rejects(() => bank.shareBrigadeImage(db, guide, input, verify), (error: any) => error.statusCode === 404)
  const foreign = bank.shareBrigadeImageSchema.parse({ url: imageUrl(1, 2), folderName: 'Calanques' })
  await assert.rejects(() => bank.shareBrigadeImage(db, guide, foreign, verify), (error: any) => error.statusCode === 403)
  await assert.rejects(() => bank.shareBrigadeImage(db, guide, { ...foreign, url: imageUrl(), variants: [{ url: variantUrl(1, 2), width: 640 }] }, verify))
  assert.equal(await db.brigadeImageFolder.count(), 0)
  assert.equal(await db.brigadeImage.count(), 0)
})

test('folder filters, accent-insensitive location search and pagination are consistent', async () => {
  const { image } = await bank.shareBrigadeImage(db, guide, bank.shareBrigadeImageSchema.parse({ url: imageUrl(), folderName: 'Céüse' }), verify)
  await db.brigadeImage.createMany({ data: Array.from({ length: 25 }, (_, index) => ({
    url: imageUrl(index + 2), folderId: image.folder.id, credit: 'Camille', alt: 'Dalle', uploadedById: 1,
  })) })
  const result = await imagesAPI({ query: { search: 'ceuse', folderId: String(image.folder.id), page: '2' } })
  assert.equal(result.total, 26)
  assert.equal(result.images.length, 2)
  assert.equal(result.pageCount, 2)
  assert.equal((await imagesAPI({ query: { search: 'Verdon' } })).total, 0)
})

test('all image bank endpoints reject visitors, climbers and guides who have not completed signup', async () => {
  for (const endpoint of [foldersAPI, imagesAPI, shareAPI]) {
    user = null
    await assert.rejects(() => endpoint({}), (error: any) => error.statusCode === 401)
    user = { id: 3, role: 'CLIMBER', onboarded: true }
    await assert.rejects(() => endpoint({}), (error: any) => error.statusCode === 403)
    user = { id: 1, role: 'GUIDE', onboarded: false }
    await assert.rejects(() => endpoint({}), (error: any) => error.statusCode === 403)
    user = { id: 3, role: 'GUIDE', onboarded: true }
    await assert.rejects(() => endpoint({}), (error: any) => error.statusCode === 403)
  }
})

test('invalid submissions and missing local files are rejected before an image is shared', async () => {
  for (const body of [
    { url: imageUrl(), folderName: ' ' },
    { url: imageUrl(), folderName: 'Verdon', folderId: 1 },
    { url: imageUrl() },
    { url: imageUrl(), folderName: 'Verdon', variants: [{ url: variantUrl(), width: -1 }] },
  ]) await assert.rejects(() => shareAPI({ body }), (error: any) => error.statusCode === 400)
  await assert.rejects(() => imagesAPI({ query: { page: '0' } }), (error: any) => error.statusCode === 400)
  await assert.rejects(() => shareAPI({ body: { url: imageUrl(), folderName: 'Verdon' } }), (error: any) => error.statusCode === 400)
  assert.equal(await db.brigadeImage.count(), 0)
})

test('only owned local uploads and Blob paths are accepted, with no external URL fetch', async () => {
  assert.ok(uploads.ownedBrigadeUploadPath(imageUrl(), 1))
  assert.ok(uploads.ownedBrigadeUploadPath('https://example.public.blob.vercel-storage.com/guides/1/cover/photo-random.webp', 1))
  for (const url of [
    imageUrl(1, 2), 'https://example.com/guides/1/cover/photo.webp',
    'https://example.public.blob.vercel-storage.com/guides/2/cover/photo.webp',
    'https://example.public.blob.vercel-storage.com/guides/1/profile/photo.webp',
    'https://example.public.blob.vercel-storage.com/guides/1/cover/photo.webp?token=anything',
    '/uploads/moniteurs/../secret.webp', 'data:image/png;base64,anything', 'blob:local',
  ]) {
    assert.equal(uploads.ownedBrigadeUploadPath(url, 1), null)
    await assert.rejects(() => uploads.verifyBrigadeUploads(1, [url]), (error: any) => error.statusCode === 403)
  }
})
