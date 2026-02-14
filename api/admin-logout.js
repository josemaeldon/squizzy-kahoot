const { sessions } = require('./admin-login')

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Logout - clear session
      const cookies = req.headers.cookie
      if (cookies) {
        const sessionCookie = cookies.split(';').find(c => c.trim().startsWith('session='))
        if (sessionCookie) {
          const sessionToken = sessionCookie.split('=')[1]
          sessions.delete(sessionToken)
        }
      }
      
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict')
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ success: true }))
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error in admin logout:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao fazer logout',
      message: error.message
    }))
  }
}
