#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Copy seed database if it doesn't exist
if [ -f /app/seed/multiplicity.db ] && [ ! -f /app/data/multiplicity.db ]; then
  echo "Copying seed database..."
  cp /app/seed/multiplicity.db /app/data/multiplicity.db
  # Ensure the database file is owned by nextjs user
  chown nextjs:nodejs /app/data/multiplicity.db 2>/dev/null || true
  echo "✓ Database seeded"
fi

# Run migration to add host column if needed
if [ -f /app/add-host-column.js ]; then
  echo "🔄 Checking if host column migration is needed..."
  export NODE_PATH=/app/node_modules
  node /app/add-host-column.js || echo "⚠ Migration failed or not needed, continuing..."
fi

# Ensure data directory is owned by nextjs (if we have permissions)
chown -R nextjs:nodejs /app/data 2>/dev/null || true

# Check if directory is writable
if [ ! -w /app/data ]; then
  echo "⚠ Warning: /app/data is not writable by current user"
fi

echo "Database path: /app/data/multiplicity.db"
ls -la /app/data/ 2>&1 || true

# Switch to nextjs user and run the application
exec su-exec nextjs node server.js

