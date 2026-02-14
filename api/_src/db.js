const { Pool } = require('pg')

// Support both Laravel-style DB_* and POSTGRES_* environment variables
// DB_* variables take precedence for compatibility with the provided stack
const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres',
  port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
  database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'squizzy',
  user: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'squizzy',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'squizzy',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
  // Log error but don't crash - let the pool handle reconnection
})

module.exports = pool
