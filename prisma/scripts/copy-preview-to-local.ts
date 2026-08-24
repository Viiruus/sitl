import fs from 'node:fs'
import path from 'node:path'
import { createClient, type Client, type InStatement } from '@libsql/client'
import { parse } from 'dotenv'

const argumentValue = (name: string, fallback: string) => {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

const previewEnvPath = path.resolve(
  argumentValue('--preview-env', '.env.preview.local'),
)
const localDatabasePath = path.resolve(
  argumentValue('--local-database', 'prisma/dev.db'),
)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const temporaryDatabasePath = `${localDatabasePath}.preprod-${timestamp}.tmp`
const backupDatabasePath = `${localDatabasePath}.backup-${timestamp}`

const quoteIdentifier = (identifier: string) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Identifiant SQL invalide : ${identifier}`)
  }
  return `"${identifier}"`
}

const readPreviewConnection = () => {
  if (!fs.existsSync(previewEnvPath)) {
    throw new Error(`Fichier d’environnement introuvable : ${previewEnvPath}`)
  }

  const env = parse(fs.readFileSync(previewEnvPath))
  const url = env.TURSO_DATABASE_URL || env.LIBSQL_URL
  const authToken = env.TURSO_AUTH_TOKEN || env.LIBSQL_AUTH_TOKEN
  if (!url || !authToken) {
    throw new Error(
      `TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requis dans ${previewEnvPath}`,
    )
  }
  return { url, authToken }
}

const chunk = <T>(values: T[], size: number) => {
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

const copyTable = async (source: Client, target: Client, table: string) => {
  const columnsResult = await source.execute(
    `PRAGMA table_info(${quoteIdentifier(table)})`,
  )
  const columns = columnsResult.rows.map(row => String(row.name))
  if (!columns.length) return 0

  const rowsResult = await source.execute(
    `SELECT ${columns.map(quoteIdentifier).join(', ')} FROM ${quoteIdentifier(table)}`,
  )
  const statements: InStatement[] = rowsResult.rows.map(row => ({
    sql: `INSERT INTO ${quoteIdentifier(table)} (${columns
      .map(quoteIdentifier)
      .join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    args: columns.map(column => row[column] ?? null),
  }))

  for (const statementsChunk of chunk(statements, 100)) {
    await target.batch(statementsChunk, 'write')
  }
  return statements.length
}

const tableCount = async (client: Client, table: string) => {
  const result = await client.execute(
    `SELECT COUNT(*) AS "count" FROM ${quoteIdentifier(table)}`,
  )
  return Number(result.rows[0]?.count || 0)
}

const main = async () => {
  if (fs.existsSync(`${localDatabasePath}-wal`) || fs.existsSync(`${localDatabasePath}-shm`)) {
    throw new Error(
      'La base locale semble utilisée. Arrête le serveur local avant de relancer la copie.',
    )
  }

  fs.mkdirSync(path.dirname(localDatabasePath), { recursive: true })
  if (fs.existsSync(temporaryDatabasePath)) fs.unlinkSync(temporaryDatabasePath)

  const source = createClient(readPreviewConnection())
  const target = createClient({ url: `file:${temporaryDatabasePath}` })

  try {
    const schemaResult = await source.execute(
      `SELECT "type", "name", "sql"
       FROM "sqlite_master"
       WHERE "sql" IS NOT NULL
       ORDER BY CASE "type" WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END, "name"`,
    )
    const tables = schemaResult.rows.filter(
      row => row.type === 'table' && !String(row.name).startsWith('sqlite_'),
    )
    const secondarySchema = schemaResult.rows.filter(
      row => row.type !== 'table' && !String(row.name).startsWith('sqlite_'),
    )

    await target.execute('PRAGMA foreign_keys = OFF')
    for (const table of tables) {
      await target.execute(String(table.sql))
    }

    const copiedCounts = new Map<string, number>()
    for (const table of tables) {
      const tableName = String(table.name)
      copiedCounts.set(tableName, await copyTable(source, target, tableName))
    }

    for (const schemaEntry of secondarySchema) {
      await target.execute(String(schemaEntry.sql))
    }

    await target.execute('PRAGMA foreign_keys = ON')
    const foreignKeyCheck = await target.execute('PRAGMA foreign_key_check')
    if (foreignKeyCheck.rows.length) {
      throw new Error(
        `La copie contient ${foreignKeyCheck.rows.length} erreur(s) de clé étrangère.`,
      )
    }
    const integrityCheck = await target.execute('PRAGMA integrity_check')
    if (String(integrityCheck.rows[0]?.integrity_check) !== 'ok') {
      throw new Error('La vérification d’intégrité de la copie locale a échoué.')
    }

    for (const table of tables) {
      const tableName = String(table.name)
      const sourceCount = copiedCounts.get(tableName) || 0
      const targetCount = await tableCount(target, tableName)
      if (sourceCount !== targetCount) {
        throw new Error(
          `Comptage incohérent pour ${tableName} : ${sourceCount} / ${targetCount}`,
        )
      }
    }

    console.log(`Copie validée : ${tables.length} tables.`)
    for (const table of ['User', 'GuideProfile', 'Aventure', 'AventureSession', 'Booking', 'Article']) {
      if (copiedCounts.has(table)) {
        console.log(`- ${table}: ${copiedCounts.get(table)}`)
      }
    }
  } finally {
    source.close()
    target.close()
  }

  let movedExistingDatabase = false
  try {
    if (fs.existsSync(localDatabasePath)) {
      fs.renameSync(localDatabasePath, backupDatabasePath)
      movedExistingDatabase = true
    }
    fs.renameSync(temporaryDatabasePath, localDatabasePath)
  } catch (error) {
    if (movedExistingDatabase && !fs.existsSync(localDatabasePath)) {
      fs.renameSync(backupDatabasePath, localDatabasePath)
    }
    throw error
  }

  console.log(`Base locale remplacée : ${localDatabasePath}`)
  if (movedExistingDatabase) {
    console.log(`Sauvegarde précédente : ${backupDatabasePath}`)
  }
}

main().catch(error => {
  if (fs.existsSync(temporaryDatabasePath)) fs.unlinkSync(temporaryDatabasePath)
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
