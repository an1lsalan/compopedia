#!/bin/sh
set -e

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Then run the main container command (CMD)
exec "$@"