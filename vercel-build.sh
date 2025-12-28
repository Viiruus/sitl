#!/usr/bin/env bash
set -euo pipefail

echo "VERCEL_ENV=${VERCEL_ENV:-<empty>}"

npx nuxt prepare
npx prisma generate

if [ "${VERCEL_ENV:-}" = "preview" ]; then
  echo "Preview -> seeding Turso"
  npx tsx prisma/seed.ts
else
  echo "Not preview -> skip seed"
fi

npx nuxt build
