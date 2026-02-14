#!/usr/bin/env node

// Migration script to add PIN column to existing databases
const pool = require('./api/_src/db')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('Running migration to add PIN column to matches table...')
  
  try {
    // Check if PIN column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'matches' 
      AND column_name = 'pin'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✓ PIN column already exists. No migration needed.')
      process.exit(0)
    }
    
    // Read and execute migration
    const migrationPath = path.join(__dirname, 'database/add-pin-column.sql')
    const migration = fs.readFileSync(migrationPath, 'utf8')
    
    await pool.query(migration)
    
    console.log('✓ Migration completed successfully!')
    console.log('✓ PIN column added to matches table')
    
    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
