import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('ensure-phone-columns: missing TURSO_DATABASE_URL/DATABASE_URL')
  process.exit(1)
}

const client = createClient({
  url,
  authToken: token,
})

async function hasColumn(name: string) {
  const result = await client.execute(`PRAGMA table_info("User");`)
  return result.rows.some((row: any) => row.name === name)
}

async function ensureColumns() {
  const missing: string[] = []

  if (!(await hasColumn('phoneNumber'))) {
    missing.push('phoneNumber')
  }
  if (!(await hasColumn('whatsappOptIn'))) {
    missing.push('whatsappOptIn')
  }

  if (!missing.length) {
    console.log('ensure-phone-columns: already present')
    return
  }

  console.log(`ensure-phone-columns: adding ${missing.join(', ')}`)
  // Apply separately to avoid failing if one exists
  if (missing.includes('phoneNumber')) {
    await client.execute(`ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;`)
  }
  if (missing.includes('whatsappOptIn')) {
    await client.execute(`ALTER TABLE "User" ADD COLUMN "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false;`)
  }
}

ensureColumns()
  .then(() => client.close())
  .catch((err) => {
    console.error('ensure-phone-columns: failed', err)
    client.close()
    process.exit(1)
  })
