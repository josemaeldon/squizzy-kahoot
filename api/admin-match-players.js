const pool = require('./_src/db')

// Note: Authentication should be handled at the routing level (e.g., in server.js)
// This endpoint should only be accessible to authenticated admin users
module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    
    if (req.method === 'GET') {
      // Get all players for a specific match
      const matchId = url.searchParams.get('matchId')
      
      if (!matchId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Match ID é obrigatório' }))
        return
      }
      
      const query = `
        SELECT 
          mp.id as match_player_id,
          p.id as player_id,
          p.name as player_name,
          mp.score,
          mp.joined_at
        FROM match_players mp
        JOIN players p ON mp.player_id = p.id
        WHERE mp.match_id = $1
        ORDER BY mp.score DESC, mp.joined_at ASC
      `
      const result = await pool.query(query, [matchId])
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify(result.rows))
      
    } else if (req.method === 'DELETE') {
      // Remove a player from a match
      const matchPlayerId = url.searchParams.get('matchPlayerId')
      
      if (!matchPlayerId) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Match Player ID é obrigatório' }))
        return
      }
      
      // Delete the match_player relationship
      const result = await pool.query(
        'DELETE FROM match_players WHERE id = $1 RETURNING *',
        [matchPlayerId]
      )
      
      if (result.rows.length === 0) {
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Jogador não encontrado na partida' }))
        return
      }
      
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, removed: result.rows[0] }))
      
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 405
      res.end(JSON.stringify({ error: 'Método não permitido' }))
    }
  } catch (error) {
    console.error('Error in admin match players endpoint:', error)
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ 
      error: 'Erro ao processar requisição',
      message: error.message
    }))
  }
}
