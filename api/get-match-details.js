const { fetchMatchWithPlayers } = require('./_src/dbApi')
const pool = require('./_src/db')

module.exports = async (req, res) => {
  // Allow GET requests only
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  
  try {
    // Get slug from query parameter
    let slug = req.query && req.query.slug
    if (!slug && req.url) {
      const urlPart = req.url.split('?slug=')[1]
      if (urlPart) {
        slug = urlPart.split('&')[0]
      }
    }
    
    if (!slug) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'Match slug is required' }))
      return
    }
    
    // Fetch match with players
    const match = await fetchMatchWithPlayers(slug)
    
    if (!match) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 404
      res.end(JSON.stringify({ error: 'Match not found' }))
      return
    }
    
    // Fetch questions for the quiz
    const questionsQuery = `
      SELECT q.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'choice_text', c.choice_text,
                   'is_correct', c.is_correct,
                   'order_index', c.order_index
                 ) ORDER BY c.order_index
               ) FILTER (WHERE c.id IS NOT NULL),
               '[]'::json
             ) as choices
      FROM questions q
      LEFT JOIN choices c ON q.id = c.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id
      ORDER BY q.order_index
    `
    const questionsResult = await pool.query(questionsQuery, [match.quiz_id])
    
    // Fetch answers for this match
    const answersQuery = `
      SELECT a.*,
             json_build_object(
               'id', p.id,
               'name', p.name
             ) as player
      FROM answers a
      JOIN players p ON a.player_id = p.id
      WHERE a.match_id = $1
    `
    const answersResult = await pool.query(answersQuery, [match.id])
    
    // Get current question if match is in progress
    let currentQuestion = null
    let currentQuestionKey = null
    if (match.current_question_index >= 0 && questionsResult.rows.length > match.current_question_index) {
      currentQuestion = questionsResult.rows[match.current_question_index]
      currentQuestionKey = currentQuestion.id
    }
    
    // Format response to match expected structure
    const response = {
      ...match,
      slug: {
        current: match.slug
      },
      quiz: {
        ...match.quiz,
        questions: questionsResult.rows
      },
      questions: questionsResult.rows,
      answers: answersResult.rows,
      currentQuestionKey: currentQuestionKey,
      startedAt: match.started_at,
      finishedAt: match.ended_at
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(response))
  } catch (error) {
    console.error('Error fetching match details:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Failed to fetch match details',
      message: error.message
    }))
  }
}
