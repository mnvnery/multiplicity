#!/usr/bin/env node
/**
 * Add host column to events table if it doesn't exist
 */

import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

const dbPath = process.env.DATABASE_URI?.replace('file:', '') || '/app/data/multiplicity.db'

try {
  const client = createClient({ url: `file:${dbPath}` })

  // Check if database exists
  try {
    readFileSync(dbPath)
  } catch (e) {
    console.log('⚠️  Database not found, skipping host column migration')
    process.exit(0)
  }

  // Check if host column exists
  const tableInfo = await client.execute(`PRAGMA table_info(events);`)
  const columns = tableInfo.rows.map((row) => row[1])

  if (columns.includes('host')) {
    console.log('✅ Host column already exists')
  } else {
    console.log('➕ Adding host column to events table...')
    await client.execute(`ALTER TABLE events ADD COLUMN host TEXT;`)
    console.log('✅ Host column added successfully')
  }

  await client.close()
  process.exit(0)
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
