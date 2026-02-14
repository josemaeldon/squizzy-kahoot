const { query } = require('./_src/db')

module.exports = async (req, res) => {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { pin } = req.query

    if (!pin) {
      res.status(400).json({ error: 'PIN is required' })
      return
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      res.status(400).json({ error: 'PIN must be exactly 4 digits' })
      return
    }

    // Find match by PIN
    const result = await query(
      'SELECT slug, id FROM matches WHERE pin = $1 AND ended_at IS NULL',
      [pin]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Match not found or already ended' })
      return
    }

    const match = result.rows[0]

    res.status(200).json({
      slug: match.slug,
      matchId: match.id
    })
  } catch (error) {
    console.error('Error finding match by PIN:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
