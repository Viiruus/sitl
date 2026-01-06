#!/usr/bin/env bash
set -euo pipefail

echo "VERCEL_ENV=${VERCEL_ENV:-<empty>}"
echo "Branch URL: https://${VERCEL_BRANCH_URL:-<empty>}"

echo "TURSO_DATABASE_URL is set? $([ -n "${TURSO_DATABASE_URL:-}" ] && echo yes || echo no)"
echo "TURSO_AUTH_TOKEN is set? $([ -n "${TURSO_AUTH_TOKEN:-}" ] && echo yes || echo no)"

# Normalize Turso URL for Prisma (needs libsql:// scheme, not https://)
if [ -n "${TURSO_DATABASE_URL:-}" ]; then
  # trim whitespace/newlines just in case
  CLEAN_URL="$(printf '%s' "$TURSO_DATABASE_URL" | tr -d '[:space:]')"
  case "$CLEAN_URL" in
    https://*)
      CLEAN_URL="libsql://${CLEAN_URL#https://}"
      ;;
    http://*)
      CLEAN_URL="libsql://${CLEAN_URL#http://}"
      ;;
    libsqls://*)
      CLEAN_URL="libsql://${CLEAN_URL#libsqls://}"
      ;;
  esac
  export TURSO_DATABASE_URL="$CLEAN_URL"
  echo "Normalized TURSO_DATABASE_URL scheme -> $(printf '%s' "$TURSO_DATABASE_URL" | sed 's#://.*#://***#')"
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
