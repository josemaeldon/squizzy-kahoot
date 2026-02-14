const pool = require('./_src/db')
const { nanoid } = require('nanoid')

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // List all matches with quiz info
      const query = `
        SELECT m.*,
               json_build_object(
                 'id', q.id,
                 'title', q.title,
                 'description', q.description
               ) as quiz
        FROM matches m
        JOIN quizzes q ON m.quiz_id = q.id
        ORDER BY m.created_at DESC
      `
      const result = await pool.query(query)
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify(result.rows))
      
    } else if (req.method === 'POST') {
      // Create a new match
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { quizId, slug } = JSON.parse(body)
          
          if (!quizId || !slug) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Quiz ID e slug são obrigatórios' }))
            return
          }
          
          // Check if slug already exists
          const checkQuery = `SELECT id FROM matches WHERE slug = $1`
          const checkResult = await pool.query(checkQuery, [slug])
          
          if (checkResult.rows.length > 0) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Este slug já está em uso' }))
            return
          }
          
          const query = `
            INSERT INTO matches (slug, quiz_id, status)
            VALUES ($1, $2, 'waiting')
            RETURNING *
          `
          const result = await pool.query(query, [slug, quizId])
          
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 201
          res.end(JSON.stringify(result.rows[0]))
        } catch (parseError) {
          console.error('Error parsing request:', parseError)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Requisição inválida' }))
        }
      })
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error in admin matches endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
