#!/bin/sh

cd server

echo "==> Running migrations..."
npx prisma migrate deploy || echo "==> Migration warning (continuing anyway)"

echo "==> Starting server on port ${PORT:-4000}..."
exec node dist/index.js
