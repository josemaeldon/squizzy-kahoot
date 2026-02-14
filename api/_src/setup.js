const pool = require('./db')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

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
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const schemaPath = path.join(__dirname, '../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // PostgreSQL supports executing multiple statements in a single query
    // This is safer than splitting by semicolons which can break on complex statements
    await client.query(schema)
    
    await client.query('COMMIT')
    console.log('Database schema initialized successfully')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error initializing database schema:', error)
    throw error
  } finally {
    client.release()
  }
}

// Load seed data
async function loadSeedData() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const seedPath = path.join(__dirname, '../../database/seed.sql')
    const seed = fs.readFileSync(seedPath, 'utf8')
    
    // PostgreSQL supports executing multiple statements in a single query
    await client.query(seed)
    
    await client.query('COMMIT')
    console.log('Seed data loaded successfully')
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error loading seed data:', error)
    throw error
  } finally {
    client.release()
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
    
    // Check if any admin users already exist
    const existingAdmins = await pool.query('SELECT COUNT(*) as count FROM admins')
    if (existingAdmins.rows[0].count > 0) {
      throw new Error('Admin user already exists. Setup can only be run once.')
    }
    
    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    
    await pool.query(`
      INSERT INTO admins (username, password_hash) 
      VALUES ($1, $2)
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
