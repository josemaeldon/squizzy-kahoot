const { sessions, SESSION_DURATION } = require('./admin-login')

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // Check if user is authenticated
      const cookies = req.headers.cookie
      
      if (!cookies) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ authenticated: false }))
        return
      }
      
      const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session='))
      
      if (!sessionCookie) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ authenticated: false }))
        return
      }
      
      const sessionToken = sessionCookie.split('=')[1]
      const session = sessions.get(sessionToken)
      
      if (!session) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ authenticated: false }))
        return
      }
      
      // Check if session is expired
      if (Date.now() - session.createdAt > SESSION_DURATION) {
        sessions.delete(sessionToken)
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ authenticated: false }))
        return
      }
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ 
        authenticated: true,
        username: session.username
      }))
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error checking auth status:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao verificar autenticação',
      message: error.message
    }))
  }
}
