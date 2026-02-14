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
 * Run a single migration file
 */
async function runMigration(migration) {
  const migrationPath = path.join(__dirname, migration.file)
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migration.file}`)
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  // Execute the migration SQL
  await pool.query(sql)
  
  // Mark as applied
  await markMigrationApplied(migration.name)
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('Starting database migrations...')
  
  try {
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
