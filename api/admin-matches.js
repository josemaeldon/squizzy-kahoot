const pool = require('./_src/db')
const { nanoid } = require('nanoid')

// Validate slug format (only lowercase letters, numbers, and hyphens)
function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug)
}

// Generate a unique 4-digit PIN
async function generateUniquePIN() {
  const maxAttempts = 10
  for (let i = 0; i < maxAttempts; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString() // 1000-9999
    
    // Check if PIN is already in use
    const checkQuery = `SELECT id FROM matches WHERE pin = $1`
    const checkResult = await pool.query(checkQuery, [pin])
    
    if (checkResult.rows.length === 0) {
      return pin
    }
  }
  throw new Error('Could not generate unique PIN after multiple attempts')
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    
    if (req.method === 'GET') {
      // List all matches with quiz info and player count
      const query = `
        SELECT m.*,
               json_build_object(
                 'id', q.id,
                 'title', q.title,
                 'description', q.description
               ) as quiz,
               COUNT(DISTINCT mp.player_id) as player_count
        FROM matches m
        JOIN quizzes q ON m.quiz_id = q.id
        LEFT JOIN match_players mp ON m.id = mp.match_id
        GROUP BY m.id, q.id
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
          
          // Validate slug format
          if (!isValidSlug(slug)) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Slug deve conter apenas letras minúsculas, números e hífens' }))
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
          
          // Generate unique PIN
          const pin = await generateUniquePIN()
          
          const query = `
            INSERT INTO matches (slug, pin, quiz_id, status)
            VALUES ($1, $2, $3, 'waiting')
            RETURNING *
          `
          const result = await pool.query(query, [slug, pin, quizId])
          
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
      // Update a match
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { id, slug, quizId, status } = JSON.parse(body)
          
          if (!id) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'ID da partida é obrigatório' }))
            return
          }
          
          // Build update query dynamically based on provided fields
          const updates = []
          const values = []
          let paramCount = 1
          
          if (slug !== undefined) {
            // Validate slug format
            if (!isValidSlug(slug)) {
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Slug deve conter apenas letras minúsculas, números e hífens' }))
              return
            }
            
            // Check if new slug is already in use by another match
            const checkQuery = `SELECT id FROM matches WHERE slug = $1 AND id != $2`
            const checkResult = await pool.query(checkQuery, [slug, id])
            
            if (checkResult.rows.length > 0) {
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Este slug já está em uso' }))
              return
            }
            
            updates.push(`slug = $${paramCount}`)
            values.push(slug)
            paramCount++
          }
          
          if (quizId !== undefined) {
            updates.push(`quiz_id = $${paramCount}`)
            values.push(quizId)
            paramCount++
          }
          
          if (status !== undefined) {
            updates.push(`status = $${paramCount}`)
            values.push(status)
            paramCount++
          }
          
          if (updates.length === 0) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Nenhum campo para atualizar' }))
            return
          }
          
          values.push(id)
          const query = `
            UPDATE matches
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
          `
          const result = await pool.query(query, values)
          
          if (result.rows.length === 0) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Partida não encontrada' }))
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
      // Delete a match
      const matchId = url.searchParams.get('id')
      
      if (!matchId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'ID da partida é obrigatório' }))
        return
      }
      
      const result = await pool.query('DELETE FROM matches WHERE id = $1 RETURNING id', [matchId])
      
      if (result.rows.length === 0) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Partida não encontrada' }))
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
    console.error('Error in admin matches endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
