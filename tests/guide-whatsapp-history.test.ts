import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3'

// Exécution : TSX_TSCONFIG_PATH=.nuxt/tsconfig.server.json node --import tsx --test tests/guide-whatsapp-history.test.ts
// Base jetable et transport simulé : aucun envoi WhatsApp réel.
const directory = mkdtempSync(join(tmpdir(), 'bdk-whatsapp-history-'))
const databasePath = join(directory, 'test.db')
let db: any
let history: typeof import('../server/utils/guide-whatsapp-history')
let sender: typeof import('../server/utils/whatsapp-otp')
let bookings: typeof import('../server/utils/whatsapp-booking-subscription')
let contact: typeof import('../server/utils/whatsapp-guide-contact')
let admin: typeof import('../server/utils/admin-whatsapp-messages')
let api: (event: any) => Promise<any>
let legacy: any
let providerCalls = 0
let currentUser: any = null
const originalFetch = globalThis.fetch

before(async () => {
  // Écarter toute configuration de base distante dans ce processus de test.
  for (const key of ['VERCEL', 'VERCEL_ENV', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'LIBSQL_URL', 'LIBSQL_AUTH_TOKEN']) delete process.env[key]
  process.env.DATABASE_URL = `file:${databasePath}`
  process.env.WHATSAPP_CLOUD_TOKEN = 'test-token'
  process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-id'
  const sqlite = new Database(databasePath)
  sqlite.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE User (id INTEGER PRIMARY KEY, email TEXT, role TEXT, firstName TEXT, lastName TEXT, isAdmin BOOLEAN);
    INSERT INTO User VALUES (1, 'admin@example.com', 'GUIDE', 'Camille', 'Martin', 1);
    INSERT INTO User VALUES (2, 'guide@example.com', 'GUIDE', 'Alex', 'Durand', 0);
    INSERT INTO User VALUES (3, 'climber@example.com', 'CLIMBER', 'Léa', 'Petit', 0);
    CREATE TABLE GuideContactRequest (
      id INTEGER PRIMARY KEY, guideId INTEGER, climberId INTEGER,
      climberNameSnapshot TEXT, climberPhoneSnapshot TEXT, guidePhoneSnapshot TEXT,
      templateName TEXT, messagePreview TEXT, message TEXT, messageId TEXT, messageStatus TEXT,
      failureReason TEXT, sentAt DATETIME, createdAt DATETIME, updatedAt DATETIME
    );
    INSERT INTO GuideContactRequest VALUES (
      1, 2, 3, 'Léa Petit', '+33600000003', '+33600000002', 'guide_contact_request',
      'Une sortie en famille ?', 'Une sortie en famille ?\nNous aimerions découvrir la falaise ensemble.', 'wamid.legacy', 'delivered', NULL,
      '2026-10-31T10:00:00.000Z', '2026-10-31T10:00:00.000Z', '2026-10-31T10:01:00.000Z'
    );
  `)
  sqlite.exec(readFileSync(new URL('../prisma/migrations/20261102120000_add_guide_whatsapp_message_history/migration.sql', import.meta.url), 'utf8'))
  legacy = sqlite.prepare('SELECT * FROM GuideWhatsAppMessage').get()
  sqlite.close()

  history = await import('../server/utils/guide-whatsapp-history')
  sender = await import('../server/utils/whatsapp-otp')
  bookings = await import('../server/utils/whatsapp-booking-subscription')
  contact = await import('../server/utils/whatsapp-guide-contact')
  admin = await import('../server/utils/admin-whatsapp-messages')
  db = await (await import('../server/utils/prisma')).prisma()
  Object.assign(globalThis, {
    defineEventHandler: (handler: any) => handler,
    getUserSession: async () => currentUser ? { user: currentUser } : null,
    getQuery: (event: any) => event.query || {},
    setResponseHeader: () => {},
    createError: (options: any) => Object.assign(new Error(options.statusMessage), options),
  })
  api = (await import('../server/api/admin/whatsapp-messages.get')).default as any
})

beforeEach(async () => {
  await db.guideWhatsAppMessage.deleteMany()
  await db.guideContactRequest.deleteMany({ where: { id: { not: 1 } } })
  providerCalls = 0
  currentUser = null
  globalThis.fetch = async () => {
    providerCalls += 1
    return new Response(JSON.stringify({ messages: [{ id: `wamid.test-${providerCalls}` }] }), { status: 200 })
  }
})

after(async () => {
  globalThis.fetch = originalFetch
  const state = (globalThis as any).__bdkPrismaState
  if (state?.promise) await (await state.promise).$disconnect()
  await db?.$disconnect()
  rmSync(directory, { recursive: true, force: true })
})

const bookingInput = {
  guideId: 2, phoneNumber: '+33600000002', stageTitle: 'Stage en falaise',
  stageLocalization: 'Chamonix', stageDate: '12 novembre 2026',
  climberFirstName: 'Léa', climberLastName: 'Petit', climberPhoneNumber: '+33600000003',
}

test('migration: preserves known contact delivery status and the preview actually transmitted', () => {
  assert.equal(legacy.guideNameSnapshot, 'Alex Durand')
  assert.equal(legacy.phoneNumber, '+33600000002')
  assert.equal(legacy.status, 'delivered')
  assert.equal(legacy.messageId, 'wamid.legacy')
  assert.equal(legacy.kind, 'CONTACT_REQUEST')
  assert.equal(JSON.parse(legacy.components)[0].parameters[2].text, 'Une sortie en famille ?')
})

test('all five guide notification types are recorded with recipient and provider IDs', async () => {
  await bookings.sendGuideNewSubscriptionViaWhatsapp(bookingInput)
  await bookings.sendGuideClimberStageCancelationViaWhatsapp(bookingInput)
  await bookings.sendGuideStageDatePropositionViaWhatsapp(bookingInput)
  await contact.sendGuideContactRequestViaWhatsapp({
    guideId: 2, phoneNumber: bookingInput.phoneNumber, climberName: 'Léa Petit',
    climberPhoneNumber: bookingInput.climberPhoneNumber, messagePreview: 'Une sortie en famille ?',
  })
  await sender.sendTemplateViaWhatsapp({
    phone: bookingInput.phoneNumber, templateName: 'welcome_guide', language: 'fr',
    components: [{ type: 'header', parameters: [{ type: 'text', parameter_name: 'firstname', text: 'Alex' }] }],
    guideMessage: { guideId: 2, kind: 'WELCOME' },
  })
  const result = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({}))
  assert.equal(result.total, 5)
  assert.deepEqual(new Set(result.messages.map(message => message.kind)), new Set(['WELCOME', 'NEW_SUBSCRIPTION', 'CANCELLATION', 'DATE_SUGGESTION', 'CONTACT_REQUEST']))
  for (const message of result.messages) {
    assert.equal(message.guideId, 2)
    assert.equal(message.guideName, 'Alex Durand')
    assert.equal(message.status, 'accepted')
    assert.ok(message.messageId?.startsWith('wamid.test-'))
    assert.ok(message.sentAt)
  }
  const suggestion = result.messages.find(message => message.kind === 'DATE_SUGGESTION')!
  assert.deepEqual(suggestion.details.find(detail => detail.label === 'Dates'), { label: 'Dates', value: bookingInput.stageDate })
})

test('admin shows the full contact request while preserving the WhatsApp excerpt', async () => {
  const fullMessage = `Bonjour, nous aimerions organiser une sortie en famille.\n\n${'Voici les détails de notre projet 🧗. '.repeat(35)}\nDernière phrase à afficher intégralement.`
  const preview = contact.buildGuideContactMessagePreview(fullMessage)
  assert.equal(preview.length, 280)
  await db.guideContactRequest.create({ data: {
    guideId: 2, climberId: 3, message: fullMessage, messagePreview: preview,
    climberNameSnapshot: 'Léa Petit', climberPhoneSnapshot: '+33600000003',
    guidePhoneSnapshot: '+33600000002', messageId: 'wamid.test-1',
  }, select: { id: true } })
  await contact.sendGuideContactRequestViaWhatsapp({
    guideId: 2, phoneNumber: '+33600000002', climberName: 'Léa Petit',
    climberPhoneNumber: '+33600000003', messagePreview: preview,
  })
  const result = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({ kind: 'CONTACT_REQUEST' }))
  assert.equal(result.messages[0].fullContactMessage, fullMessage)
  assert.equal(result.messages[0].details.find(detail => detail.label === 'Message')?.value, preview)
  assert.equal(providerCalls, 1)

  // Un envoi attribué à un autre moniteur ne doit pas récupérer cette demande.
  await db.guideWhatsAppMessage.update({ where: { id: result.messages[0].id }, data: { guideId: 1 } })
  const otherGuide = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({}))
  assert.equal(otherGuide.messages[0].fullContactMessage, null)
})

test('historical contacts recover their full text without changing the stored notification', async () => {
  await db.guideWhatsAppMessage.create({ data: {
    guideId: 2, guideNameSnapshot: legacy.guideNameSnapshot, phoneNumber: legacy.phoneNumber,
    kind: 'CONTACT_REQUEST', templateName: legacy.templateName, language: 'fr',
    components: JSON.parse(legacy.components), messageId: legacy.messageId, status: legacy.status,
  } })
  const result = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({}))
  assert.equal(result.messages[0].fullContactMessage, 'Une sortie en famille ?\nNous aimerions découvrir la falaise ensemble.')
  assert.equal(result.messages[0].details.find(detail => detail.label === 'Message')?.value, 'Une sortie en famille ?')
})

test('contact history still displays the available excerpt if the original request is unavailable', async () => {
  await contact.sendGuideContactRequestViaWhatsapp({
    guideId: 2, phoneNumber: '+33600000002', climberName: 'Léa Petit',
    climberPhoneNumber: '+33600000003', messagePreview: 'Message conservé dans la notification.',
  })
  const result = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({}))
  assert.equal(result.messages[0].fullContactMessage, null)
  assert.equal(result.messages[0].details.find(detail => detail.label === 'Message')?.value, 'Message conservé dans la notification.')
})

test('authentication and climber confirmations are never recorded in guide history', async () => {
  await sender.sendOtpViaWhatsapp(bookingInput.phoneNumber, '123456')
  await bookings.sendClimberSubscriptionOkViaWhatsapp({ ...bookingInput, stageUrlPath: 'stage-en-falaise' })
  // Même un contexte erroné pointant sur un grimpeur ne doit pas créer d’entrée.
  await sender.sendTemplateViaWhatsapp({
    phone: '+33600000003', templateName: 'welcome_guide',
    guideMessage: { guideId: 3, kind: 'WELCOME' },
  })
  assert.equal(providerCalls, 3)
  assert.equal(await db.guideWhatsAppMessage.count(), 0)
})

test('failed sends and network exceptions are recorded without retrying the send', async t => {
  t.mock.method(console, 'error', () => {})
  globalThis.fetch = async () => {
    providerCalls += 1
    return new Response(JSON.stringify({ error: { message: 'Template rejected' } }), { status: 400 })
  }
  const result = await bookings.sendGuideNewSubscriptionViaWhatsapp(bookingInput)
  assert.equal(result.ok, false)
  const networkError = new Error('network unavailable')
  globalThis.fetch = async () => { providerCalls += 1; throw networkError }
  await assert.rejects(() => bookings.sendGuideClimberStageCancelationViaWhatsapp(bookingInput), error => error === networkError)
  const rows = await db.guideWhatsAppMessage.findMany()
  assert.equal(providerCalls, 2)
  assert.equal(rows.length, 2)
  for (const row of rows) {
    assert.equal(row.status, 'failed')
    assert.equal(row.sentAt, null)
    assert.ok(row.failureReason)
  }
})

test('a history write failure does not block or duplicate a WhatsApp send', async t => {
  t.mock.method(console, 'error', () => {})
  await db.$executeRawUnsafe('ALTER TABLE GuideWhatsAppMessage RENAME TO HistoryUnavailable')
  try {
    const result = await bookings.sendGuideNewSubscriptionViaWhatsapp(bookingInput)
    assert.equal(result.ok, true)
    assert.equal(providerCalls, 1)
  } finally {
    await db.$executeRawUnsafe('ALTER TABLE HistoryUnavailable RENAME TO GuideWhatsAppMessage')
  }
})

const webhook = (id: string, status: string, timestamp = '1793620000') => ({
  entry: [{ changes: [{ value: { statuses: [{ id, status, timestamp, errors: status === 'failed' ? [{ code: 131026, title: 'Undeliverable' }] : undefined }] } }] }],
})

test('webhooks track delivery, read and failure without regressing on late events', async () => {
  await bookings.sendGuideNewSubscriptionViaWhatsapp(bookingInput)
  await history.consumeGuideMessageHistoryWebhook(webhook('wamid.test-1', 'delivered'))
  await history.consumeGuideMessageHistoryWebhook(webhook('wamid.test-1', 'read', '1793620001'))
  await history.consumeGuideMessageHistoryWebhook(webhook('wamid.test-1', 'sent', '1793620002'))
  await history.consumeGuideMessageHistoryWebhook(webhook('wamid.unknown-auth', 'read'))
  assert.equal((await db.guideWhatsAppMessage.findUnique({ where: { messageId: 'wamid.test-1' } })).status, 'read')
  assert.equal(await db.guideWhatsAppMessage.count(), 1)
  await bookings.sendGuideClimberStageCancelationViaWhatsapp(bookingInput)
  await history.consumeGuideMessageHistoryWebhook(webhook('wamid.test-2', 'failed'))
  const failed = await db.guideWhatsAppMessage.findUnique({ where: { messageId: 'wamid.test-2' } })
  assert.equal(failed.status, 'failed')
  assert.match(failed.failureReason, /131026/)
})

test('admin filters and pagination exclude unexpected authentication rows', async () => {
  await db.guideWhatsAppMessage.createMany({ data: Array.from({ length: 35 }, (_, index) => ({
    guideId: 2, guideNameSnapshot: 'Alex Durand', phoneNumber: '+33600000002',
    kind: index === 0 ? 'GUIDE_LOGIN' : 'WELCOME', templateName: 'test', language: 'fr', components: [], status: 'sent',
  })) })
  const result = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({ page: '2', search: 'Alex', status: 'sent' }))
  assert.equal(result.total, 34)
  assert.equal(result.messages.length, 4)
  assert.equal(result.pageCount, 2)
  assert.ok(result.messages.every(message => message.kind === 'WELCOME'))
  const filtered = await admin.listAdminWhatsAppMessages(db, admin.adminWhatsAppQuerySchema.parse({ kind: 'CONTACT_REQUEST' }))
  assert.equal(filtered.total, 0)
  assert.equal(admin.adminWhatsAppQuerySchema.safeParse({ page: '0' }).success, false)
  assert.equal(admin.adminWhatsAppQuerySchema.safeParse({ kind: 'GUIDE_LOGIN' }).success, false)
})

test('admin API requires a current administrator and validates filters', async () => {
  await assert.rejects(() => api({}), (error: any) => error.statusCode === 401)
  currentUser = { id: 2, role: 'GUIDE', isAdmin: true }
  // Le drapeau de session seul ne suffit pas : les droits sont relus en base.
  await assert.rejects(() => api({}), (error: any) => error.statusCode === 403)
  currentUser = { id: 1, role: 'GUIDE', isAdmin: true }
  assert.equal((await api({})).total, 0)
  await assert.rejects(() => api({ query: { kind: 'GUIDE_LOGIN' } }), (error: any) => error.statusCode === 400)
})
