#!/usr/bin/env node

// Migration script to add PINs to existing matches that don't have them
const pool = require('./api/_src/db')

// Generate a unique 4-digit PIN
async function generateUniquePIN() {
  const maxAttempts = 500 // Increased for better collision handling
  for (let i = 0; i < maxAttempts; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString() // 1000-9999
    
    // Check if PIN is already in use
    const checkQuery = `SELECT id FROM matches WHERE pin = $1`
    const checkResult = await pool.query(checkQuery, [pin])
    
    if (checkResult.rows.length === 0) {
      return pin
    }
  }
  throw new Error('Could not generate unique PIN after multiple attempts. Database may have too many matches.')
}

async function updateMatchesWithPins() {
  console.log('Checking for matches without PINs...')
  
  try {
    // Get all matches without PINs
    const matchesQuery = `
      SELECT id, slug 
      FROM matches 
      WHERE pin IS NULL
    `
    const result = await pool.query(matchesQuery)
    
    if (result.rows.length === 0) {
      console.log('✓ All matches already have PINs. No updates needed.')
      process.exit(0)
    }
    
    console.log(`Found ${result.rows.length} matches without PINs. Generating...`)
    
    // Generate and assign PINs to each match
    for (const match of result.rows) {
      const pin = await generateUniquePIN()
      await pool.query(
        'UPDATE matches SET pin = $1 WHERE id = $2',
        [pin, match.id]
      )
      console.log(`✓ Added PIN ${pin} to match: ${match.slug}`)
    }
    
    console.log(`✓ Successfully added PINs to ${result.rows.length} matches!`)
    process.exit(0)
  } catch (error) {
    console.error('✗ Failed to update matches:', error)
    process.exit(1)
  }
}

updateMatchesWithPins()
