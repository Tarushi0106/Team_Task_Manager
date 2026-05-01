#!/bin/sh
set -e

cd server

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting server..."
node dist/index.js
