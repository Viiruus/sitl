#!/usr/bin/env bash
set -euo pipefail

echo "VERCEL_ENV=${VERCEL_ENV:-<empty>}"
echo "Branch URL: https://${VERCEL_BRANCH_URL:-<empty>}"

echo "TURSO_DATABASE_URL is set? $([ -n "${TURSO_DATABASE_URL:-}" ] && echo yes || echo no)"
echo "TURSO_AUTH_TOKEN is set? $([ -n "${TURSO_AUTH_TOKEN:-}" ] && echo yes || echo no)"

# Normalize Turso URL for Prisma (needs libsql:// scheme, not https://)
if [ -n "${TURSO_DATABASE_URL:-}" ] && echo "$TURSO_DATABASE_URL" | grep -q '^https://'; then
  export TURSO_DATABASE_URL="libsql://$(echo "$TURSO_DATABASE_URL" | sed 's#^https://##')"
  echo "Normalized TURSO_DATABASE_URL to libsql:// scheme for Prisma"
fi

npx nuxt prepare
npx prisma generate
# ✅ Apply migrations so new columns (phone/WhatsApp, etc.) exist before seeding/using the DB
npx prisma migrate deploy

if [ "${VERCEL_ENV:-}" = "preview" ]; then
  echo "Preview -> seeding Turso"
  npx tsx prisma/seed.ts
else
  echo "Not preview -> skip seed"
fi

npx nuxt build
