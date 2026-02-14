const pool = require('./_src/db')
const { MATCH_STATUS } = require('./_src/constants')

// Note: Authentication should be handled at the routing level (e.g., in server.js)
// This endpoint should only be accessible to authenticated admin users
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
      return
    }

    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })

    req.on('end', async () => {
      try {
        const { matchId } = JSON.parse(body)

        if (!matchId) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'ID da partida é obrigatório' }))
          return
        }

        // Update match to set ended_at timestamp and status to completed
        const query = `
          UPDATE matches
          SET ended_at = CURRENT_TIMESTAMP,
              status = $1
          WHERE id = $2
          RETURNING *
        `
        const result = await pool.query(query, [MATCH_STATUS.COMPLETED, matchId])

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
  } catch (error) {
    console.error('Error in finish match endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
