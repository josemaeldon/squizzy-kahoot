const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

// Enable CORS
app.use(cors())

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// API routes - import serverless function handlers
const pingHandler = require('./api/ping')
const signUpPlayerHandler = require('./api/sign-up-player')
const submitAnswerHandler = require('./api/submit-answer')
const withdrawPlayerHandler = require('./api/withdraw-player')

// Wrap serverless function handlers for Express
const wrapHandler = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error(`Error handling ${req.method} ${req.path}:`, error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// API endpoints
app.all('/api/ping', wrapHandler(pingHandler))
app.all('/api/sign-up-player', wrapHandler(signUpPlayerHandler))
app.all('/api/submit-answer', wrapHandler(submitAnswerHandler))
app.all('/api/withdraw-player', wrapHandler(withdrawPlayerHandler))

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
