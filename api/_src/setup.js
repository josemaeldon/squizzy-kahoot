const pool = require('./db')
const fs = require('fs')
const path = require('path')

// Check if database is initialized
async function checkDatabaseInitialized() {
  try {
    // Check if quizzes table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quizzes'
      )
    `)
    return result.rows[0].exists
  } catch (error) {
    console.error('Error checking database initialization:', error)
    return false
  }
}

// Initialize database schema
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('Database schema initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database schema:', error)
    throw error
  }
}

// Load seed data
async function loadSeedData() {
  try {
    const seedPath = path.join(__dirname, '../../database/seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')
    
    await pool.query(seed)
    console.log('Seed data loaded successfully')
    return true
  } catch (error) {
    console.error('Error loading seed data:', error)
    throw error
  }
}

// Create admin user table and user
async function createAdminUser(username, password) {
  try {
    // Create admin table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // For simplicity, we're storing a simple hash (in production, use bcrypt)
    // This is a basic implementation for the auto-installer
    const crypto = require('crypto')
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    
    await pool.query(`
      INSERT INTO admins (username, password_hash) 
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE SET 
        password_hash = $2,
        updated_at = CURRENT_TIMESTAMP
    `, [username, passwordHash])
    
    console.log('Admin user created successfully')
    return true
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

// Complete setup
async function completeSetup(config) {
  const { adminUsername, adminPassword, loadSampleData } = config
  
  try {
    // Initialize database schema
    await initializeDatabase()
    
    // Create admin user
    if (adminUsername && adminPassword) {
      await createAdminUser(adminUsername, adminPassword)
    }
    
    // Load sample data if requested
    if (loadSampleData) {
      await loadSeedData()
    }
    
    return { success: true, message: 'Setup completed successfully' }
  } catch (error) {
    console.error('Error completing setup:', error)
    throw error
  }
}

module.exports = {
  checkDatabaseInitialized,
  initializeDatabase,
  loadSeedData,
  createAdminUser,
  completeSetup
}
