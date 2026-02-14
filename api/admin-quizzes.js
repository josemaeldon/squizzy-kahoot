const pool = require('./_src/db')

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    
    if (req.method === 'GET') {
      // List all quizzes with question count
      const query = `
        SELECT q.id, q.title, q.description, q.image_url, q.created_at,
               COUNT(qu.id) as question_count
        FROM quizzes q
        LEFT JOIN questions qu ON q.id = qu.quiz_id
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `
      const result = await pool.query(query)
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify(result.rows))
      
    } else if (req.method === 'POST') {
      // Create a new quiz
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { title, description, image_url } = JSON.parse(body)
          
          if (!title) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'O título é obrigatório' }))
            return
          }
          
          const query = `
            INSERT INTO quizzes (title, description, image_url)
            VALUES ($1, $2, $3)
            RETURNING *
          `
          const result = await pool.query(query, [title, description || null, image_url || null])
          
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
      
    } else if (req.method === 'PUT') {
      // Update a quiz
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { id, title, description, image_url } = JSON.parse(body)
          
          if (!id || !title) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'ID e título são obrigatórios' }))
            return
          }
          
          const query = `
            UPDATE quizzes
            SET title = $1, description = $2, image_url = $3
            WHERE id = $4
            RETURNING *
          `
          const result = await pool.query(query, [title, description || null, image_url || null, id])
          
          if (result.rows.length === 0) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Quiz não encontrado' }))
            return
          }
          
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(result.rows[0]))
        } catch (parseError) {
          console.error('Error parsing request:', parseError)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Requisição inválida' }))
        }
      })
      
    } else if (req.method === 'DELETE') {
      // Delete a quiz
      const quizId = url.searchParams.get('id')
      
      if (!quizId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'ID do quiz é obrigatório' }))
        return
      }
      
      const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING id', [quizId])
      
      if (result.rows.length === 0) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Quiz não encontrado' }))
        return
      }
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ success: true }))
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error in admin quizzes endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
