#!/usr/bin/env bash
set -euo pipefail

echo "VERCEL_ENV=${VERCEL_ENV:-<empty>}"
echo "Branch URL: https://${VERCEL_BRANCH_URL:-<empty>}"

echo "TURSO_DATABASE_URL is set? $([ -n "${TURSO_DATABASE_URL:-}" ] && echo yes || echo no)"
echo "TURSO_AUTH_TOKEN is set? $([ -n "${TURSO_AUTH_TOKEN:-}" ] && echo yes || echo no)"


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
