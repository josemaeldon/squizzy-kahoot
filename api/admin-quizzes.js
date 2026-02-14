const pool = require('./_src/db')

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // List all quizzes
      const query = `
        SELECT id, title, description, image_url, created_at
        FROM quizzes
        ORDER BY created_at DESC
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
