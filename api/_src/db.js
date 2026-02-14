const { Pool } = require('pg')

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'squizzy',
  user: process.env.POSTGRES_USER || 'squizzy',
  password: process.env.POSTGRES_PASSWORD || 'squizzy',
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
