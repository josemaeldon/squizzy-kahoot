const { checkDatabaseInitialized } = require('./_src/setup')

module.exports = async (req, res) => {
  try {
    const isInitialized = await checkDatabaseInitialized()
    
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify({ 
      initialized: isInitialized,
      needsSetup: !isInitialized
    }))
  } catch (error) {
    console.error('Error checking setup status:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Failed to check setup status',
      message: error.message
    }))
  }
}
