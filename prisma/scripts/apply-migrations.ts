import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')

if (!url) {
  console.error('apply-migrations: missing TURSO_DATABASE_URL/DATABASE_URL')
  process.exit(1)
}

const client = createClient({ url, authToken: token })

async function ensureMigrationsTable() {
  // Matches Prisma's _prisma_migrations structure for SQLite
  await client.executeMultiple(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `)
}

async function listApplied(): Promise<Set<string>> {
  const result = await client.execute(`SELECT migration_name FROM "_prisma_migrations";`)
  const names = new Set<string>()
  for (const row of result.rows as any[]) {
    const name = row.migration_name || row.migration_name?.toString?.()
    if (name) names.add(name as string)
  }
  return names
}

function getMigrations(): { name: string; sqlPath: string }[] {
  if (!fs.existsSync(migrationsDir)) return []
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort()
    .map((name) => ({
      name,
      sqlPath: path.join(migrationsDir, name, 'migration.sql'),
    }))
    .filter(({ sqlPath }) => fs.existsSync(sqlPath))
}

async function applyMigration(name: string, sqlPath: string) {
  const sql = fs.readFileSync(sqlPath, 'utf8')
  console.log(`apply-migrations: applying ${name}`)
  await client.executeMultiple(sql)

  const checksum = crypto.createHash('sha256').update(sql).digest('hex')
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await client.execute({
    sql: `INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count")
          VALUES (:id, :checksum, :finished_at, :name, '', NULL, :started_at, 1);`,
    args: { id, checksum, finished_at: now, name, started_at: now },
  })
}

async function main() {
  await ensureMigrationsTable()
  const applied = await listApplied()
  const migrations = getMigrations()

  for (const { name, sqlPath } of migrations) {
    if (applied.has(name)) {
      console.log(`apply-migrations: skip ${name} (already applied)`)
      continue
    }
    await applyMigration(name, sqlPath)
  }

  console.log('apply-migrations: done')
}

main()
  .catch((err) => {
    console.error('apply-migrations: failed', err)
    process.exit(1)
  })
  .finally(() => {
    client.close()
  })
