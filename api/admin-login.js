const pool = require('./_src/db')
const bcrypt = require('bcrypt')
const {nanoid} = require('nanoid')

// Simple in-memory session store (for production, use Redis or database)
// NOTE: This implementation is suitable for single-instance deployments.
// For production with Docker Swarm or multiple instances, consider:
// - Redis-backed sessions (e.g., connect-redis with express-session)
// - Database-backed sessions
// - JWT tokens with proper refresh token mechanism
const sessions = new Map()
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Cleanup expired sessions every hour
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_DURATION) {
      sessions.delete(token)
    }
  }
}, 60 * 60 * 1000) // Run every hour

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Login
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })

      req.on('end', async () => {
        try {
          let {username, password} = JSON.parse(body)

          // Trim username and password to avoid whitespace issues
          username = username?.trim()
          password = password?.trim()

          if (!username || !password) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({error: 'Usuário e senha são obrigatórios'}))
            return
          }

          // Find admin user
          const query = 'SELECT * FROM admins WHERE username = $1'
          const result = await pool.query(query, [username])

          if (result.rows.length === 0) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 401
            res.end(JSON.stringify({error: 'Usuário ou senha incorretos'}))
            return
          }

          const admin = result.rows[0]

          // Verify password
          const passwordMatch = await bcrypt.compare(password, admin.password_hash)

          if (!passwordMatch) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 401
            res.end(JSON.stringify({error: 'Usuário ou senha incorretos'}))
            return
          }

          // Create session
          const sessionToken = nanoid(32)
          sessions.set(sessionToken, {
            adminId: admin.id,
            username: admin.username,
            createdAt: Date.now()
          })

          // Set session cookie
          res.setHeader(
            'Set-Cookie',
            `session=${sessionToken}; Path=/; HttpOnly; Max-Age=${SESSION_DURATION /
              1000}; SameSite=Strict`
          )
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(
            JSON.stringify({
              success: true,
              username: admin.username
            })
          )
        } catch (parseError) {
          console.error('Error parsing request:', parseError)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({error: 'Requisição inválida'}))
        }
      })
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({error: 'Método não permitido'}))
    }
  } catch (error) {
    console.error('Error in admin login:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(
      JSON.stringify({
        error: 'Erro ao fazer login',
        message: error.message
      })
    )
  }
}

// Export sessions map for use in other modules
module.exports.sessions = sessions
module.exports.SESSION_DURATION = SESSION_DURATION
