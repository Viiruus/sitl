#!/usr/bin/env bash
set -euo pipefail

echo "=== RUNNING vercel-build.sh ==="
echo "VERCEL_ENV=${VERCEL_ENV:-<empty>}"

npx nuxt prepare
npx prisma generate
npx prisma migrate deploy

if [ "${VERCEL_ENV:-}" = "preview" ]; then
  echo "Preview deploy -> running seed"
  npx prisma db seed
else
  echo "Not preview -> skip seed"
fi

npx nuxt build