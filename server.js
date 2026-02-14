const express = require('express')
const path = require('path')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 80

// Enable CORS
app.use(cors())

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Apply rate limiting to API routes
app.use('/api/', apiLimiter)

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// API routes - import serverless function handlers
const pingHandler = require('./api/ping')
const signUpPlayerHandler = require('./api/sign-up-player')
const submitAnswerHandler = require('./api/submit-answer')
const withdrawPlayerHandler = require('./api/withdraw-player')
const setupStatusHandler = require('./api/setup-status')
const setupHandler = require('./api/setup')
const getMatchDetailsHandler = require('./api/get-match-details')
const adminQuizzesHandler = require('./api/admin-quizzes')
const adminMatchesHandler = require('./api/admin-matches')
const adminQuestionsHandler = require('./api/admin-questions')
const adminLoginHandler = require('./api/admin-login')
const adminLogoutHandler = require('./api/admin-logout')
const adminAuthStatusHandler = require('./api/admin-auth-status')

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
app.all('/api/setup-status', wrapHandler(setupStatusHandler))
app.all('/api/setup', wrapHandler(setupHandler))
app.all('/api/sign-up-player', wrapHandler(signUpPlayerHandler))
app.all('/api/submit-answer', wrapHandler(submitAnswerHandler))
app.all('/api/withdraw-player', wrapHandler(withdrawPlayerHandler))
app.all('/api/get-match-details', wrapHandler(getMatchDetailsHandler))
app.all('/api/admin/quizzes', wrapHandler(adminQuizzesHandler))
app.all('/api/admin/matches', wrapHandler(adminMatchesHandler))
app.all('/api/admin/questions', wrapHandler(adminQuestionsHandler))
app.all('/api/admin/login', wrapHandler(adminLoginHandler))
app.all('/api/admin/logout', wrapHandler(adminLogoutHandler))
app.all('/api/admin/auth-status', wrapHandler(adminAuthStatusHandler))

// Serve index.html for all other routes (SPA fallback)
// Note: This serves static HTML files and doesn't need rate limiting
// as it's not performing any dynamic operations or database queries
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})
