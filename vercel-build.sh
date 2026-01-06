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
  # add authToken to the URL for Prisma migrate CLI (adapter token isn't used there)
  if [ -n "${TURSO_AUTH_TOKEN:-}" ]; then
    TOKENIZED_URL="${CLEAN_URL}"
    if echo "$TOKENIZED_URL" | grep -q '?'; then
      TOKENIZED_URL="${TOKENIZED_URL}&authToken=${TURSO_AUTH_TOKEN}"
    else
      TOKENIZED_URL="${TOKENIZED_URL}?authToken=${TURSO_AUTH_TOKEN}"
    fi
  else
    TOKENIZED_URL="$CLEAN_URL"
  fi

  export TURSO_DATABASE_URL="$TOKENIZED_URL"
  export DATABASE_URL="$TOKENIZED_URL" # prisma CLI may still look for DATABASE_URL
  echo "Normalized TURSO_DATABASE_URL -> $(printf '%s' "$TURSO_DATABASE_URL" | sed 's#://.*#://***#')"
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
