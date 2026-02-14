#!/usr/bin/env node

/**
 * Legacy migration script - now uses the unified migration system
 * This script is kept for backward compatibility
 */

const { runMigrations } = require('./database/migrations')

console.log('Running database migrations...')
console.log('Note: This script now uses the unified migration system.')
console.log('')

runMigrations()
  .then(() => {
    console.log('All migrations completed successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
