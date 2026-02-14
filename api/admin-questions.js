const pool = require('./_src/db')

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    if (req.method === 'GET') {
      // Get questions for a specific quiz
      const quizId = url.searchParams.get('quizId')
      
      if (!quizId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Quiz ID é obrigatório' }))
        return
      }
      
      // Get all questions with their choices
      const query = `
        SELECT 
          q.id,
          q.quiz_id,
          q.question_text,
          q.image_url,
          q.time_limit,
          q.points,
          q.order_index,
          json_agg(
            json_build_object(
              'id', c.id,
              'choice_text', c.choice_text,
              'is_correct', c.is_correct,
              'order_index', c.order_index
            ) ORDER BY c.order_index
          ) FILTER (WHERE c.id IS NOT NULL) as choices
        FROM questions q
        LEFT JOIN choices c ON q.id = c.question_id
        WHERE q.quiz_id = $1
        GROUP BY q.id
        ORDER BY q.order_index
      `
      const result = await pool.query(query, [quizId])
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify(result.rows))
      
    } else if (req.method === 'POST') {
      // Create a new question with choices
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { quizId, questionText, imageUrl, timeLimit, points, choices } = JSON.parse(body)
          
          if (!quizId || !questionText) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Quiz ID e texto da pergunta são obrigatórios' }))
            return
          }
          
          const client = await pool.connect()
          try {
            await client.query('BEGIN')
            
            // Get the next order_index
            const orderQuery = `
              SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
              FROM questions
              WHERE quiz_id = $1
            `
            const orderResult = await client.query(orderQuery, [quizId])
            const orderIndex = orderResult.rows[0].next_order
            
            // Insert question
            const questionQuery = `
              INSERT INTO questions (quiz_id, question_text, image_url, time_limit, points, order_index)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
            `
            const questionResult = await client.query(questionQuery, [
              quizId,
              questionText,
              imageUrl || null,
              timeLimit || 20,
              points || 100,
              orderIndex
            ])
            
            const question = questionResult.rows[0]
            
            // Insert choices if provided
            if (choices && Array.isArray(choices) && choices.length > 0) {
              for (let i = 0; i < choices.length; i++) {
                const choice = choices[i]
                await client.query(`
                  INSERT INTO choices (question_id, choice_text, is_correct, order_index)
                  VALUES ($1, $2, $3, $4)
                `, [question.id, choice.choiceText, choice.isCorrect || false, i + 1])
              }
            }
            
            await client.query('COMMIT')
            
            // Fetch the complete question with choices
            const fetchQuery = `
              SELECT 
                q.*,
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'choice_text', c.choice_text,
                    'is_correct', c.is_correct,
                    'order_index', c.order_index
                  ) ORDER BY c.order_index
                ) FILTER (WHERE c.id IS NOT NULL) as choices
              FROM questions q
              LEFT JOIN choices c ON q.id = c.question_id
              WHERE q.id = $1
              GROUP BY q.id
            `
            const fetchResult = await client.query(fetchQuery, [question.id])
            
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 201
            res.end(JSON.stringify(fetchResult.rows[0]))
          } catch (error) {
            await client.query('ROLLBACK')
            throw error
          } finally {
            client.release()
          }
        } catch (parseError) {
          console.error('Error parsing request:', parseError)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Requisição inválida' }))
        }
      })
      
    } else if (req.method === 'PUT') {
      // Update a question
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      req.on('end', async () => {
        try {
          const { questionId, questionText, imageUrl, timeLimit, points, choices } = JSON.parse(body)
          
          if (!questionId || !questionText) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'ID da pergunta e texto são obrigatórios' }))
            return
          }
          
          const client = await pool.connect()
          try {
            await client.query('BEGIN')
            
            // Update question
            const questionQuery = `
              UPDATE questions
              SET question_text = $1, image_url = $2, time_limit = $3, points = $4
              WHERE id = $5
              RETURNING *
            `
            await client.query(questionQuery, [
              questionText,
              imageUrl || null,
              timeLimit || 20,
              points || 100,
              questionId
            ])
            
            // Update choices if provided
            if (choices && Array.isArray(choices)) {
              // Delete existing choices
              await client.query('DELETE FROM choices WHERE question_id = $1', [questionId])
              
              // Insert new choices
              for (let i = 0; i < choices.length; i++) {
                const choice = choices[i]
                await client.query(`
                  INSERT INTO choices (question_id, choice_text, is_correct, order_index)
                  VALUES ($1, $2, $3, $4)
                `, [questionId, choice.choiceText, choice.isCorrect || false, i + 1])
              }
            }
            
            await client.query('COMMIT')
            
            // Fetch the updated question with choices
            const fetchQuery = `
              SELECT 
                q.*,
                json_agg(
                  json_build_object(
                    'id', c.id,
                    'choice_text', c.choice_text,
                    'is_correct', c.is_correct,
                    'order_index', c.order_index
                  ) ORDER BY c.order_index
                ) FILTER (WHERE c.id IS NOT NULL) as choices
              FROM questions q
              LEFT JOIN choices c ON q.id = c.question_id
              WHERE q.id = $1
              GROUP BY q.id
            `
            const fetchResult = await client.query(fetchQuery, [questionId])
            
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(fetchResult.rows[0]))
          } catch (error) {
            await client.query('ROLLBACK')
            throw error
          } finally {
            client.release()
          }
        } catch (parseError) {
          console.error('Error parsing request:', parseError)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Requisição inválida' }))
        }
      })
      
    } else if (req.method === 'DELETE') {
      // Delete a question
      const questionId = url.searchParams.get('questionId')
      
      if (!questionId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'ID da pergunta é obrigatório' }))
        return
      }
      
      await pool.query('DELETE FROM questions WHERE id = $1', [questionId])
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ success: true }))
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error in admin questions endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
