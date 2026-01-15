#!/bin/sh
set -eu

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null || true)" ]; then
  echo "node_modules is empty; installing dependencies..."
  npm ci
fi

echo "Generating Prisma Client..."
npx prisma generate

if [ -d prisma/migrations ]; then
  echo "Applying Prisma migrations (deploy)..."
  npx prisma migrate deploy
else
  echo "No prisma/migrations directory; skipping migrate deploy"
fi

echo "Starting dev server..."
npm run dev
