#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script automatically runs all database migrations in the correct order.
 * It creates a migrations tracking table and only runs migrations that haven't been applied yet.
 */

const pool = require('../api/_src/db')
const fs = require('fs')
const path = require('path')

// PostgreSQL advisory lock ID for preventing concurrent migrations
// This is an arbitrary number used to uniquely identify the migration lock
const MIGRATION_LOCK_ID = 123456

// Define migrations in order
const MIGRATIONS = [
  {
    name: '001_initial_schema',
    file: 'schema.sql',
    description: 'Create initial database schema'
  },
  {
    name: '002_add_pin_column',
    file: 'add-pin-column.sql',
    description: 'Add PIN column to matches table'
  }
]

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  await pool.query(query)
}

/**
 * Check if a migration has already been applied
 */
async function isMigrationApplied(name) {
  const result = await pool.query(
    'SELECT name FROM migrations WHERE name = $1',
    [name]
  )
  return result.rows.length > 0
}

/**
 * Mark a migration as applied
 */
async function markMigrationApplied(name) {
  await pool.query(
    'INSERT INTO migrations (name) VALUES ($1)',
    [name]
  )
}

/**
 * Run a single migration file within a transaction
 */
async function runMigration(migration) {
  const migrationPath = path.join(__dirname, migration.file)
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migration.file}`)
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  // Use a transaction to ensure atomicity
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    // Execute the migration SQL
    await client.query(sql)
    
    // Mark as applied within the same transaction
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [migration.name]
    )
    
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('Starting database migrations...')
  
  // Use a client for the entire migration process with advisory lock
  const client = await pool.connect()
  
  try {
    // Acquire advisory lock to prevent concurrent migrations
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID])
    console.log('✓ Acquired migration lock')
    
    // Create migrations tracking table
    await createMigrationsTable()
    console.log('✓ Migrations tracking table ready')
    
    let appliedCount = 0
    let skippedCount = 0
    
    // Run each migration in order
    for (const migration of MIGRATIONS) {
      const isApplied = await isMigrationApplied(migration.name)
      
      if (isApplied) {
        console.log(`⊘ Skipping ${migration.name} (already applied)`)
        skippedCount++
        continue
      }
      
      console.log(`→ Running ${migration.name}: ${migration.description}`)
      await runMigration(migration)
      console.log(`✓ Completed ${migration.name}`)
      appliedCount++
    }
    
    console.log('\n========================================')
    if (appliedCount > 0) {
      console.log(`✓ Successfully applied ${appliedCount} migration(s)`)
    }
    if (skippedCount > 0) {
      console.log(`⊘ Skipped ${skippedCount} migration(s) (already applied)`)
    }
    if (appliedCount === 0 && skippedCount === 0) {
      console.log('✓ No migrations to apply')
    }
    console.log('✓ Database is up to date')
    console.log('========================================\n')
    
    return true
  } catch (error) {
    console.error('\n========================================')
    console.error('✗ Migration failed:', error.message)
    console.error('========================================\n')
    throw error
  } finally {
    // Release advisory lock
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID])
    client.release()
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration error:', error)
      process.exit(1)
    })
}

module.exports = { runMigrations }
