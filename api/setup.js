const { completeSetup, checkDatabaseInitialized } = require('./_src/setup')

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  try {
    // Check if already initialized
    const isInitialized = await checkDatabaseInitialized()
    if (isInitialized) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 400
      res.end(JSON.stringify({ 
        error: 'Database is already initialized. Setup cannot be run again.'
      }))
      return
    }
    
    // Parse request body
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    
    req.on('end', async () => {
      try {
        const config = JSON.parse(body)
        
        // Validate required fields
        if (!config.adminUsername || !config.adminPassword) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ 
            error: 'Admin username and password are required'
          }))
          return
        }
        
        // Validate password strength (minimum 8 characters)
        if (config.adminPassword.length < 8) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ 
            error: 'Password must be at least 8 characters long'
          }))
          return
        }
        
        // Complete setup
        const result = await completeSetup(config)
        
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify(result))
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ 
          error: 'Invalid request body',
          message: parseError.message
        }))
      }
    })
  } catch (error) {
    console.error('Error in setup:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Setup failed',
      message: error.message
    }))
  }
}
