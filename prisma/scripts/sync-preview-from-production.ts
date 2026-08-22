import fs from 'node:fs'
import path from 'node:path'
import { createClient, type Client, type InStatement } from '@libsql/client'
import { parse } from 'dotenv'

type DbRow = Record<string, any>
type SqlExecutor = Pick<Client, 'execute' | 'batch'>

const APPLY_FLAG = '--apply'
const apply = process.argv.includes(APPLY_FLAG)
const prune = process.argv.includes('--prune')
const importLocalArticles = process.argv.includes('--import-local-articles')

const argumentValue = (name: string, fallback: string) => {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

const productionEnvPath = path.resolve(
  argumentValue('--production-env', '.env.production.local'),
)
const previewEnvPath = path.resolve(
  argumentValue('--preview-env', '.env.preview.local'),
)
const localDatabasePath = path.resolve(
  argumentValue('--local-database', 'prisma/dev.db'),
)

const readConnection = (envPath: string) => {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Fichier d’environnement introuvable : ${envPath}`)
  }

  const env = parse(fs.readFileSync(envPath))
  const url = env.TURSO_DATABASE_URL || env.LIBSQL_URL
  const authToken = env.TURSO_AUTH_TOKEN || env.LIBSQL_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error(
      `TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requis dans ${envPath}`,
    )
  }

  return { url, authToken }
}

const productionConnection = readConnection(productionEnvPath)
const previewConnection = readConnection(previewEnvPath)

if (productionConnection.url === previewConnection.url) {
  throw new Error('La source de production et la cible de préproduction sont identiques.')
}

const production = createClient(productionConnection)
const preview = createClient(previewConnection)

const quoteIdentifier = (identifier: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Identifiant SQL invalide : ${identifier}`)
  }
  return `"${identifier}"`
}

const tableColumns = async (client: Client, table: string) => {
  const result = await client.execute(`PRAGMA table_info(${quoteIdentifier(table)})`)
  return new Set(result.rows.map((row) => String(row.name)))
}

const tableRows = async (
  client: Client,
  table: string,
  columns: string[],
  suffix = '',
) => {
  const selection = columns.map(quoteIdentifier).join(', ')
  const result = await client.execute(
    `SELECT ${selection} FROM ${quoteIdentifier(table)} ${suffix}`,
  )
  return result.rows as DbRow[]
}

const makeStatement = (
  table: string,
  values: DbRow,
  conflictColumn?: string,
): InStatement => {
  const columns = Object.keys(values)
  const args = columns.map((column) => values[column] ?? null)
  const insertColumns = columns.map(quoteIdentifier).join(', ')
  const placeholders = columns.map(() => '?').join(', ')

  let conflict = ''
  if (conflictColumn) {
    const updateColumns = columns.filter((column) => column !== conflictColumn)
    conflict = ` ON CONFLICT(${quoteIdentifier(conflictColumn)}) DO UPDATE SET ${updateColumns
      .map(
        (column) =>
          `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`,
      )
      .join(', ')}`
  }

  return {
    sql: `INSERT INTO ${quoteIdentifier(table)} (${insertColumns}) VALUES (${placeholders})${conflict}`,
    args,
  }
}

const makeUpdateStatement = (
  table: string,
  values: DbRow,
  whereColumn: string,
  whereValue: unknown,
): InStatement => {
  const columns = Object.keys(values)
  return {
    sql: `UPDATE ${quoteIdentifier(table)} SET ${columns
      .map((column) => `${quoteIdentifier(column)} = ?`)
      .join(', ')} WHERE ${quoteIdentifier(whereColumn)} = ?`,
    args: [...columns.map((column) => values[column] ?? null), whereValue as any],
  }
}

const commonColumns = (
  source: Set<string>,
  target: Set<string>,
  excluded: string[] = [],
) =>
  [...source].filter(
    (column) => target.has(column) && !excluded.includes(column),
  )

const pick = (row: DbRow, columns: string[]) =>
  Object.fromEntries(columns.map((column) => [column, row[column] ?? null]))

const normalizedName = (row: DbRow) => {
  const firstName = normalizedNamePart(row.firstName)
  const lastName = normalizedNamePart(row.lastName)
  return firstName && lastName ? `${firstName}|${lastName}` : ''
}

const normalizedNamePart = (value: unknown) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

const dateKey = (value: unknown) => {
  const date = new Date(String(value))
  return Number.isNaN(date.valueOf()) ? String(value) : date.toISOString()
}

const countTable = async (client: Client, table: string) => {
  const result = await client.execute(
    `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`,
  )
  return Number(result.rows[0]?.count || 0)
}

async function loadSnapshot() {
  const tableNames = [
    'User',
    'GuideProfile',
    'Aventure',
    'AventureImage',
    'AventureJour',
    'AventureSession',
  ] as const

  const sourceColumns = new Map<string, Set<string>>()
  const targetColumns = new Map<string, Set<string>>()
  for (const table of tableNames) {
    sourceColumns.set(table, await tableColumns(production, table))
    targetColumns.set(table, await tableColumns(preview, table))
  }

  const userPublicCandidates = [
    'id',
    'email',
    'role',
    'firstName',
    'lastName',
    'profileImageUrl',
    'typesOfClimbing',
    'onboarded',
    'onboardingStep',
  ]
  const userColumns = userPublicCandidates.filter((column) =>
    sourceColumns.get('User')!.has(column),
  )

  const guideProfileColumns = commonColumns(
    sourceColumns.get('GuideProfile')!,
    targetColumns.get('GuideProfile')!,
  )
  const aventureColumns = commonColumns(
    sourceColumns.get('Aventure')!,
    targetColumns.get('Aventure')!,
  )
  const imageColumns = commonColumns(
    sourceColumns.get('AventureImage')!,
    targetColumns.get('AventureImage')!,
  )
  const jourColumns = commonColumns(
    sourceColumns.get('AventureJour')!,
    targetColumns.get('AventureJour')!,
  )
  const sessionColumns = commonColumns(
    sourceColumns.get('AventureSession')!,
    targetColumns.get('AventureSession')!,
  )

  const [users, guideProfiles, aventures, images, jours, sessions] =
    await Promise.all([
      tableRows(production, 'User', userColumns, `WHERE "role" = 'GUIDE'`),
      tableRows(production, 'GuideProfile', guideProfileColumns),
      tableRows(production, 'Aventure', aventureColumns),
      tableRows(production, 'AventureImage', imageColumns),
      tableRows(production, 'AventureJour', jourColumns),
      tableRows(production, 'AventureSession', sessionColumns),
    ])

  return {
    sourceColumns,
    targetColumns,
    users,
    guideProfiles,
    aventures,
    images,
    jours,
    sessions,
  }
}

async function printOverview(snapshot: Awaited<ReturnType<typeof loadSnapshot>>) {
  const futureSessions = snapshot.sessions.filter(
    (session) => new Date(String(session.dateFin)).valueOf() >= Date.now(),
  ).length
  const publishedAventures = snapshot.aventures.filter(
    (aventure) => Number(aventure.estPublie) === 1,
  ).length

  const previewCounts = Object.fromEntries(
    await Promise.all(
      ['User', 'GuideProfile', 'Aventure', 'AventureSession', 'Booking', 'Article'].map(
        async (table) => [table, await countTable(preview, table)],
      ),
    ),
  )

  console.log('Source production :')
  console.log(`- ${snapshot.guideProfiles.length} profils moniteurs`)
  console.log(
    `- ${snapshot.aventures.length} stages (${publishedAventures} publiés)`,
  )
  console.log(
    `- ${snapshot.sessions.length} sessions (${futureSessions} encore à venir)`,
  )
  console.log(`- ${snapshot.images.length} images`)
  console.log(`- ${snapshot.jours.length} journées de programme`)
  console.log('Cible préproduction avant synchronisation :')
  console.log(`- ${previewCounts.User} utilisateurs`)
  console.log(`- ${previewCounts.GuideProfile} profils moniteurs`)
  console.log(`- ${previewCounts.Aventure} stages`)
  console.log(`- ${previewCounts.AventureSession} sessions`)
  console.log(`- ${previewCounts.Booking} réservations conservées`)
  console.log(`- ${previewCounts.Article} articles conservés`)
}

type LocalArticle = DbRow & {
  authorEmail: string
  authorFirstName: string | null
  authorLastName: string | null
}

async function loadLocalArticles(): Promise<LocalArticle[]> {
  if (!importLocalArticles) return []
  if (!fs.existsSync(localDatabasePath)) {
    throw new Error(`Base locale introuvable : ${localDatabasePath}`)
  }

  const local = createClient({ url: `file:${localDatabasePath}` })
  try {
    const result = await local.execute(`
      SELECT
        a.*,
        u."email" AS "authorEmail",
        u."firstName" AS "authorFirstName",
        u."lastName" AS "authorLastName"
      FROM "Article" a
      INNER JOIN "User" u ON u."id" = a."authorId"
      ORDER BY a."id"
    `)
    const articles = result.rows as LocalArticle[]

    for (const article of articles) {
      const serialized = [
        article.coverImageUrl,
        article.coverImageVariants,
        article.content,
      ]
        .filter(Boolean)
        .join('\n')
      const uploadPaths = new Set(
        serialized.match(/\/uploads\/moniteurs\/[A-Za-z0-9._-]+/g) || [],
      )
      for (const uploadPath of uploadPaths) {
        const diskPath = path.join(process.cwd(), 'public', uploadPath)
        if (!fs.existsSync(diskPath)) {
          throw new Error(
            `Image locale manquante pour l’article ${String(article.slug)} : ${uploadPath}`,
          )
        }
      }
    }

    return articles
  } finally {
    local.close()
  }
}

async function resolveLocalArticleAuthors(articles: LocalArticle[]) {
  if (!articles.length) return new Map<number, number>()

  const result = await preview.execute(
    'SELECT "id", "email", "firstName", "lastName" FROM "User"',
  )
  const targetUsers = result.rows as DbRow[]
  const byEmail = new Map(
    targetUsers.map((user) => [String(user.email).trim().toLowerCase(), user]),
  )
  const byName = new Map<string, DbRow[]>()
  for (const user of targetUsers) {
    const key = normalizedName(user)
    if (!key) continue
    byName.set(key, [...(byName.get(key) || []), user])
  }

  const authorMap = new Map<number, number>()
  for (const article of articles) {
    if (authorMap.has(Number(article.authorId))) continue

    const sameEmail = byEmail.get(
      String(article.authorEmail || '').trim().toLowerCase(),
    )
    const sameName = byName.get(
      normalizedName({
        firstName: article.authorFirstName,
        lastName: article.authorLastName,
      }),
    ) || []
    const localFirstName = normalizedNamePart(article.authorFirstName)
    const localLastName = normalizedNamePart(article.authorLastName)
    const nearNames = targetUsers.filter((user) => {
      const targetFirstName = normalizedNamePart(user.firstName)
      const targetLastName = normalizedNamePart(user.lastName)
      return (
        localFirstName.length > 1 &&
        targetFirstName === localFirstName &&
        Math.min(localLastName.length, targetLastName.length) >= 5 &&
        (localLastName.startsWith(targetLastName) ||
          targetLastName.startsWith(localLastName))
      )
    })
    const target =
      sameEmail ||
      (sameName.length === 1 ? sameName[0] : undefined) ||
      (nearNames.length === 1 ? nearNames[0] : undefined)
    if (!target) {
      throw new Error(
        `Auteur de l’article local introuvable en préproduction : ${String(article.slug)}`,
      )
    }
    authorMap.set(Number(article.authorId), Number(target.id))
  }

  return authorMap
}

async function prunePreviewData(
  productionSlugs: Set<string>,
  keptUserIds: Set<number>,
) {
  if (!prune) {
    return {
      removedStages: 0,
      removedUsers: 0,
      removedBookings: 0,
      removedArticles: 0,
    }
  }

  if (!productionSlugs.size || !keptUserIds.size) {
    throw new Error('Nettoyage refusé : la liste des données à conserver est vide.')
  }

  const targetStages = await preview.execute(
    'SELECT "id", "slug" FROM "Aventure"',
  )
  const staleStageIds = targetStages.rows
    .filter((stage) => !productionSlugs.has(String(stage.slug)))
    .map((stage) => Number(stage.id))

  const bookingCount = await countTable(preview, 'Booking')
  const articleCount = await countTable(preview, 'Article')
  const placeholders = [...keptUserIds].map(() => '?').join(', ')
  const staleUsersResult = await preview.execute({
    sql: `SELECT COUNT(*) AS "count" FROM "User" WHERE "id" NOT IN (${placeholders})`,
    args: [...keptUserIds],
  })
  const staleUserCount = Number(staleUsersResult.rows[0]?.count || 0)
  const keptStageGuidesResult = await preview.execute({
    sql: `SELECT COUNT(*) AS "count" FROM "Aventure" WHERE "slug" IN (${[
      ...productionSlugs,
    ]
      .map(() => '?')
      .join(', ')}) AND "guideId" NOT IN (${placeholders})`,
    args: [...productionSlugs, ...keptUserIds],
  })
  if (Number(keptStageGuidesResult.rows[0]?.count || 0) > 0) {
    throw new Error(
      'Nettoyage refusé : au moins un stage de production perdrait son moniteur.',
    )
  }

  const operationalStatements: InStatement[] = [
    'Booking',
    'StageNotificationDelivery',
    'StageNotificationSubscription',
    'AventureDateSuggestion',
    'GuideContactRequest',
    'AssociationMembership',
    'WhatsAppOtpChallenge',
    'Article',
  ].map((table) => ({ sql: `DELETE FROM ${quoteIdentifier(table)}`, args: [] }))
  await preview.batch(operationalStatements, 'write')

  const staleStageStatements: InStatement[] = []
  for (const aventureId of staleStageIds) {
    for (const table of ['AventureImage', 'AventureJour', 'AventureSession']) {
      staleStageStatements.push({
        sql: `DELETE FROM ${quoteIdentifier(table)} WHERE "aventureId" = ?`,
        args: [aventureId],
      })
    }
    staleStageStatements.push({
      sql: 'DELETE FROM "Aventure" WHERE "id" = ?',
      args: [aventureId],
    })
  }
  if (staleStageStatements.length) {
    await preview.batch(staleStageStatements, 'write')
  }

  await preview.batch(
    [
      {
        sql: `DELETE FROM "GuideProfile" WHERE "userId" NOT IN (${placeholders})`,
        args: [...keptUserIds],
      },
      {
        sql: `DELETE FROM "User" WHERE "id" NOT IN (${placeholders})`,
        args: [...keptUserIds],
      },
    ],
    'write',
  )

  return {
    removedStages: staleStageIds.length,
    removedUsers: staleUserCount,
    removedBookings: bookingCount,
    removedArticles: articleCount,
  }
}

async function importArticles(
  articles: LocalArticle[],
  authorMap: Map<number, number>,
) {
  if (!articles.length) return 0

  const local = createClient({ url: `file:${localDatabasePath}` })
  try {
    const sourceColumns = await tableColumns(local, 'Article')
    const targetColumns = await tableColumns(preview, 'Article')
    const columns = commonColumns(sourceColumns, targetColumns, [
      'id',
      'authorId',
    ])
    const statements: InStatement[] = []

    for (const article of articles) {
      const targetAuthorId = authorMap.get(Number(article.authorId))
      if (!targetAuthorId) {
        throw new Error(`Auteur non résolu pour ${String(article.slug)}`)
      }
      statements.push(
        makeStatement(
          'Article',
          {
            ...pick(article, columns),
            authorId: targetAuthorId,
          },
          'slug',
        ),
      )
    }
    await preview.batch(statements, 'write')
    return statements.length
  } finally {
    local.close()
  }
}

async function syncGuides(snapshot: Awaited<ReturnType<typeof loadSnapshot>>) {
  const previewUsersResult = await preview.execute(
    'SELECT "id", "email", "firstName", "lastName" FROM "User"',
  )
  const previewUsers = previewUsersResult.rows as DbRow[]
  const usersByEmail = new Map(
    previewUsers.map((user) => [String(user.email).trim().toLowerCase(), user]),
  )
  const usersByName = new Map<string, DbRow[]>()
  for (const user of previewUsers) {
    const key = normalizedName(user)
    if (!key) continue
    usersByName.set(key, [...(usersByName.get(key) || []), user])
  }

  const allowedUserColumns = [
    'role',
    'firstName',
    'lastName',
    'profileImageUrl',
    'typesOfClimbing',
    'onboarded',
    'onboardingStep',
  ].filter((column) => snapshot.targetColumns.get('User')!.has(column))

  const guideIdMap = new Map<number, number>()
  let created = 0
  let matched = 0

  for (const sourceUser of snapshot.users) {
    const emailKey = String(sourceUser.email || '').trim().toLowerCase()
    const placeholderEmail = `prod-guide-${sourceUser.id}@preview.invalid`
    const sameEmail = emailKey ? usersByEmail.get(emailKey) : undefined
    const samePlaceholder = usersByEmail.get(placeholderEmail)
    const sameName = usersByName.get(normalizedName(sourceUser)) || []
    const targetUser =
      sameEmail ||
      samePlaceholder ||
      (sameName.length === 1 ? sameName[0] : undefined)
    const publicValues = pick(sourceUser, allowedUserColumns)
    publicValues.role = 'GUIDE'
    const now = new Date().toISOString()

    let targetUserId: number
    if (targetUser) {
      targetUserId = Number(targetUser.id)
      await preview.execute(
        makeUpdateStatement(
          'User',
          {
            ...publicValues,
            ...(snapshot.targetColumns.get('User')!.has('updatedAt')
              ? { updatedAt: now }
              : {}),
          },
          'id',
          targetUserId,
        ),
      )
      matched += 1
    } else {
      const result = await preview.execute(
        makeStatement('User', {
          email: placeholderEmail,
          ...publicValues,
          ...(snapshot.targetColumns.get('User')!.has('createdAt')
            ? { createdAt: now }
            : {}),
          ...(snapshot.targetColumns.get('User')!.has('updatedAt')
            ? { updatedAt: now }
            : {}),
        }),
      )
      targetUserId = Number(result.lastInsertRowid)
      created += 1
    }

    guideIdMap.set(Number(sourceUser.id), targetUserId)
  }

  const profileColumns = commonColumns(
    snapshot.sourceColumns.get('GuideProfile')!,
    snapshot.targetColumns.get('GuideProfile')!,
    ['id', 'userId'],
  )
  const profileStatements: InStatement[] = []
  for (const profile of snapshot.guideProfiles) {
    const targetUserId = guideIdMap.get(Number(profile.userId))
    if (!targetUserId) continue
    profileStatements.push(
      makeStatement(
        'GuideProfile',
        {
          userId: targetUserId,
          ...pick(profile, profileColumns),
        },
        'userId',
      ),
    )
  }
  if (profileStatements.length) {
    await preview.batch(profileStatements, 'write')
  }

  const productionGuideIds = new Set(guideIdMap.values())
  const targetProfiles = await preview.execute(
    'SELECT "id", "userId", "isPublic" FROM "GuideProfile"',
  )
  const hiddenProfileStatements = targetProfiles.rows
    .filter(
      (profile) =>
        !productionGuideIds.has(Number(profile.userId)) &&
        Number(profile.isPublic) === 1,
    )
    .map((profile) =>
      makeUpdateStatement(
        'GuideProfile',
        { isPublic: 0, updatedAt: new Date().toISOString() },
        'id',
        profile.id,
      ),
    )
  if (hiddenProfileStatements.length) {
    await preview.batch(hiddenProfileStatements, 'write')
  }

  return {
    guideIdMap,
    created,
    matched,
    profiles: profileStatements.length,
    hiddenPreviewOnlyProfiles: hiddenProfileStatements.length,
  }
}

async function syncAventures(
  snapshot: Awaited<ReturnType<typeof loadSnapshot>>,
  guideIdMap: Map<number, number>,
) {
  const aventureColumns = commonColumns(
    snapshot.sourceColumns.get('Aventure')!,
    snapshot.targetColumns.get('Aventure')!,
    ['id', 'guideId'],
  )
  const imageColumns = commonColumns(
    snapshot.sourceColumns.get('AventureImage')!,
    snapshot.targetColumns.get('AventureImage')!,
    ['id', 'aventureId'],
  )
  const jourColumns = commonColumns(
    snapshot.sourceColumns.get('AventureJour')!,
    snapshot.targetColumns.get('AventureJour')!,
    ['id', 'aventureId'],
  )
  const sessionColumns = commonColumns(
    snapshot.sourceColumns.get('AventureSession')!,
    snapshot.targetColumns.get('AventureSession')!,
    ['id', 'aventureId'],
  )

  const imagesByAventure = Map.groupBy(snapshot.images, (row) =>
    Number(row.aventureId),
  )
  const joursByAventure = Map.groupBy(snapshot.jours, (row) =>
    Number(row.aventureId),
  )
  const sessionsByAventure = Map.groupBy(snapshot.sessions, (row) =>
    Number(row.aventureId),
  )

  const productionSlugs = new Set<string>()
  let syncedAventures = 0
  let syncedSessions = 0
  let preservedBookedSessions = 0

  for (const aventure of snapshot.aventures) {
    const targetGuideId = guideIdMap.get(Number(aventure.guideId))
    if (!targetGuideId) {
      throw new Error(
        `Impossible d’associer le moniteur du stage ${String(aventure.slug)}`,
      )
    }

    const slug = String(aventure.slug)
    productionSlugs.add(slug)
    await preview.execute(
      makeStatement(
        'Aventure',
        {
          ...pick(aventure, aventureColumns),
          guideId: targetGuideId,
        },
        'slug',
      ),
    )

    const targetAventureResult = await preview.execute({
      sql: 'SELECT "id" FROM "Aventure" WHERE "slug" = ?',
      args: [slug],
    })
    const targetAventureId = Number(targetAventureResult.rows[0]?.id)
    if (!targetAventureId) {
      throw new Error(`Stage synchronisé introuvable : ${slug}`)
    }

    const childStatements: InStatement[] = [
      {
        sql: 'DELETE FROM "AventureImage" WHERE "aventureId" = ?',
        args: [targetAventureId],
      },
      {
        sql: 'DELETE FROM "AventureJour" WHERE "aventureId" = ?',
        args: [targetAventureId],
      },
    ]

    for (const image of imagesByAventure.get(Number(aventure.id)) || []) {
      childStatements.push(
        makeStatement('AventureImage', {
          aventureId: targetAventureId,
          ...pick(image, imageColumns),
        }),
      )
    }
    for (const jour of joursByAventure.get(Number(aventure.id)) || []) {
      childStatements.push(
        makeStatement('AventureJour', {
          aventureId: targetAventureId,
          ...pick(jour, jourColumns),
        }),
      )
    }
    await preview.batch(childStatements, 'write')

    const targetSessionsResult = await preview.execute({
      sql: `SELECT s.*, COALESCE(SUM(b."participants"), 0) AS "bookedParticipants"
            FROM "AventureSession" s
            LEFT JOIN "Booking" b ON b."sessionId" = s."id"
            WHERE s."aventureId" = ?
            GROUP BY s."id"`,
      args: [targetAventureId],
    })
    const targetSessions = targetSessionsResult.rows as DbRow[]
    const targetSessionsByDate = new Map(
      targetSessions.map((session) => [dateKey(session.dateDebut), session]),
    )
    const sourceSessions = sessionsByAventure.get(Number(aventure.id)) || []
    const sourceSessionDates = new Set(
      sourceSessions.map((session) => dateKey(session.dateDebut)),
    )
    const sessionStatements: InStatement[] = []

    for (const targetSession of targetSessions) {
      if (sourceSessionDates.has(dateKey(targetSession.dateDebut))) continue
      if (Number(targetSession.bookedParticipants) > 0) {
        preservedBookedSessions += 1
        continue
      }
      sessionStatements.push({
        sql: 'DELETE FROM "AventureSession" WHERE "id" = ?',
        args: [targetSession.id],
      })
    }

    for (const sourceSession of sourceSessions) {
      const targetSession = targetSessionsByDate.get(
        dateKey(sourceSession.dateDebut),
      )
      const values = pick(sourceSession, sessionColumns)
      const bookedParticipants = Number(targetSession?.bookedParticipants || 0)
      values.placesReservees = Math.max(
        Number(values.placesReservees || 0),
        bookedParticipants,
      )

      if (targetSession) {
        sessionStatements.push(
          makeUpdateStatement(
            'AventureSession',
            { ...values, aventureId: targetAventureId },
            'id',
            targetSession.id,
          ),
        )
      } else {
        sessionStatements.push(
          makeStatement('AventureSession', {
            aventureId: targetAventureId,
            ...values,
          }),
        )
      }
      syncedSessions += 1
    }

    if (sessionStatements.length) {
      await preview.batch(sessionStatements, 'write')
    }
    syncedAventures += 1
  }

  const targetAventures = await preview.execute(
    'SELECT "id", "slug", "estPublie" FROM "Aventure"',
  )
  const staleStageStatements = targetAventures.rows
    .filter(
      (row) =>
        !productionSlugs.has(String(row.slug)) && Number(row.estPublie) === 1,
    )
    .map((row) =>
      makeUpdateStatement('Aventure', { estPublie: 0 }, 'id', row.id),
    )
  if (staleStageStatements.length) {
    await preview.batch(staleStageStatements, 'write')
  }

  return {
    syncedAventures,
    syncedSessions,
    unpublishedPreviewOnlyStages: staleStageStatements.length,
    preservedBookedSessions,
    productionSlugs,
  }
}

async function main() {
  const snapshot = await loadSnapshot()
  const localArticles = await loadLocalArticles()
  await printOverview(snapshot)
  if (importLocalArticles) {
    console.log(`- ${localArticles.length} article(s) local(aux) prêt(s) à importer`)
  }

  if (!apply) {
    console.log('')
    console.log(
      `Simulation terminée. Relancer avec ${APPLY_FLAG} pour appliquer la synchronisation.`,
    )
    return
  }

  console.log('')
  console.log('Synchronisation des contenus publics en cours…')
  const guides = await syncGuides(snapshot)
  const aventures = await syncAventures(snapshot, guides.guideIdMap)
  const localArticleAuthors = await resolveLocalArticleAuthors(localArticles)
  const keptUserIds = new Set([
    ...guides.guideIdMap.values(),
    ...localArticleAuthors.values(),
  ])
  const cleanup = await prunePreviewData(
    aventures.productionSlugs,
    keptUserIds,
  )
  const importedArticles = await importArticles(
    localArticles,
    localArticleAuthors,
  )

  const futureSessionsResult = await preview.execute(
    'SELECT COUNT(*) AS "count" FROM "AventureSession" WHERE datetime("dateFin") >= CURRENT_TIMESTAMP',
  )
  const publishedStagesResult = await preview.execute(
    'SELECT COUNT(*) AS "count" FROM "Aventure" WHERE "estPublie" = 1',
  )

  console.log('Synchronisation terminée :')
  console.log(
    `- ${guides.profiles} profils moniteurs (${guides.matched} rapprochés, ${guides.created} créés sans identifiants de connexion)`,
  )
  console.log(
    `- ${guides.hiddenPreviewOnlyProfiles} anciens profils propres à la préproduction masqués`,
  )
  console.log(`- ${aventures.syncedAventures} stages synchronisés`)
  console.log(`- ${aventures.syncedSessions} sessions synchronisées`)
  console.log(
    `- ${aventures.unpublishedPreviewOnlyStages} stages propres à la préproduction dépubliés`,
  )
  console.log(
    `- ${aventures.preservedBookedSessions} anciennes sessions conservées car liées à une réservation de préproduction`,
  )
  if (prune) {
    console.log(
      `- nettoyage : ${cleanup.removedStages} anciens stages, ${cleanup.removedUsers} anciens utilisateurs et ${cleanup.removedBookings} réservations supprimés`,
    )
  }
  if (importLocalArticles) {
    console.log(`- ${importedArticles} article(s) local(aux) importé(s)`)
  }
  console.log(
    `- ${Number(publishedStagesResult.rows[0]?.count || 0)} stages publiés et ${Number(futureSessionsResult.rows[0]?.count || 0)} sessions futures désormais disponibles`,
  )
}

main()
  .catch((error) => {
    console.error('sync-preview-from-production: échec', error)
    process.exitCode = 1
  })
  .finally(() => {
    production.close()
    preview.close()
  })
