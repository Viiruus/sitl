import { createClient } from '@libsql/client'
import { getAssociationMembershipOffer } from '../../shared/constants/association-membership.ts'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN
const args = new Set(process.argv.slice(2))

const shouldWrite = args.has('--write')
const isProductionConfirmed = args.has('--production')

if (!url) {
  console.error('backfill-association-memberships: missing TURSO_DATABASE_URL/DATABASE_URL')
  process.exit(1)
}

function assertProductionTarget(databaseUrl: string) {
  if (databaseUrl.startsWith('file:')) {
    throw new Error('Refusing to run against a local SQLite database. This script is production-only.')
  }

  if (/localhost|127\.0\.0\.1/i.test(databaseUrl)) {
    throw new Error('Refusing to run against a local database URL. This script is production-only.')
  }

  if (/preview/i.test(databaseUrl)) {
    throw new Error('Refusing to run against a preview database URL.')
  }

  if (!/^libsql:\/\//i.test(databaseUrl) && !/^https?:\/\//i.test(databaseUrl)) {
    throw new Error(`Unsupported database URL for this script: ${databaseUrl}`)
  }

  if (!isProductionConfirmed) {
    throw new Error('Missing --production flag. Dry-run or write mode both require an explicit production confirmation.')
  }
}

function getCount(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') return Number(value)
  return 0
}

function getDatabaseTargetLabel(databaseUrl: string) {
  try {
    const normalizedUrl = databaseUrl.startsWith('libsql://')
      ? `https://${databaseUrl.slice('libsql://'.length)}`
      : databaseUrl
    const parsed = new URL(normalizedUrl)
    return parsed.host || parsed.origin
  } catch {
    return databaseUrl
  }
}

async function scalarCount(client: ReturnType<typeof createClient>, sql: string, args: Record<string, unknown>) {
  const result = await client.execute({ sql, args })
  const row = result.rows[0] as Record<string, unknown> | undefined
  return getCount(row?.count)
}

async function main() {
  assertProductionTarget(url)

  const client = createClient({ url, authToken: token })
  const offer = getAssociationMembershipOffer()
  const source = `production_backfill_${offer.year}`

  try {
    const countArgs = { year: offer.year }

    const eligibleUsers = await scalarCount(
      client,
      `
        SELECT COUNT(*) AS count
        FROM "User"
        WHERE "onboarded" = TRUE
          AND "role" IN ('CLIMBER', 'GUIDE')
      `,
      {},
    )

    const existingMemberships = await scalarCount(
      client,
      `
        SELECT COUNT(*) AS count
        FROM "AssociationMembership" am
        INNER JOIN "User" u ON u."id" = am."userId"
        WHERE am."membershipYear" = :year
          AND u."onboarded" = TRUE
          AND u."role" IN ('CLIMBER', 'GUIDE')
      `,
      countArgs,
    )

    const missingMemberships = await scalarCount(
      client,
      `
        SELECT COUNT(*) AS count
        FROM "User" u
        LEFT JOIN "AssociationMembership" am
          ON am."userId" = u."id"
         AND am."membershipYear" = :year
        WHERE u."onboarded" = TRUE
          AND u."role" IN ('CLIMBER', 'GUIDE')
          AND am."id" IS NULL
      `,
      countArgs,
    )

    const summary = {
      mode: shouldWrite ? 'write' : 'dry-run',
      databaseTarget: getDatabaseTargetLabel(url),
      membershipYear: offer.year,
      amountCents: offer.amountCents,
      currency: offer.currency,
      source,
      eligibleUsers,
      existingMemberships,
      missingMemberships,
    }

    console.log(JSON.stringify(summary, null, 2))

    if (!shouldWrite) {
      console.log('backfill-association-memberships: dry-run only. Re-run with --production --write to insert missing rows.')
      return
    }

    const insertResult = await client.execute({
      sql: `
        INSERT INTO "AssociationMembership" (
          "userId",
          "membershipYear",
          "amountCents",
          "currency",
          "roleSnapshot",
          "source",
          "acceptedAt",
          "createdAt",
          "updatedAt"
        )
        SELECT
          u."id",
          :year,
          :amountCents,
          :currency,
          u."role",
          :source,
          u."createdAt",
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        FROM "User" u
        LEFT JOIN "AssociationMembership" am
          ON am."userId" = u."id"
         AND am."membershipYear" = :year
        WHERE u."onboarded" = TRUE
          AND u."role" IN ('CLIMBER', 'GUIDE')
          AND am."id" IS NULL
      `,
      args: {
        year: offer.year,
        amountCents: offer.amountCents,
        currency: offer.currency,
        source,
      },
    })

    const inserted = getCount(insertResult.rowsAffected)
    const remainingMissingMemberships = await scalarCount(
      client,
      `
        SELECT COUNT(*) AS count
        FROM "User" u
        LEFT JOIN "AssociationMembership" am
          ON am."userId" = u."id"
         AND am."membershipYear" = :year
        WHERE u."onboarded" = TRUE
          AND u."role" IN ('CLIMBER', 'GUIDE')
          AND am."id" IS NULL
      `,
      countArgs,
    )

    console.log(
      JSON.stringify(
        {
          inserted,
          remainingMissingMemberships,
        },
        null,
        2,
      ),
    )
  } finally {
    client.close()
  }
}

main().catch((error) => {
  console.error('backfill-association-memberships: failed', error)
  process.exit(1)
})
