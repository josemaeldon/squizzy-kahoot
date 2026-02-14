const { query } = require('./_src/db')

module.exports = async (req, res) => {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    let body = ''
    for await (const chunk of req) {
      body += chunk.toString()
    }
    const { matchId } = JSON.parse(body || '{}')

    if (!matchId) {
      res.status(400).json({ error: 'Match ID is required' })
      return
    }

    // Start the match by setting started_at and setting first question
    const result = await query(
      `UPDATE matches 
       SET started_at = CURRENT_TIMESTAMP, 
           current_question_index = 0,
           status = 'in_progress'
       WHERE id = $1 
       AND started_at IS NULL 
       AND ended_at IS NULL
       RETURNING id, slug, started_at, status`,
      [matchId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Match not found or already started' })
      return
    }

    const match = result.rows[0]

    res.status(200).json({
      success: true,
      match: {
        id: match.id,
        slug: match.slug,
        startedAt: match.started_at,
        status: match.status
      }
    })
  } catch (error) {
    console.error('Error starting match:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
