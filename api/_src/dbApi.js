const pool = require('./db')
const { nanoid } = require('nanoid')

const ensurePlayerExists = async (playerId, playerName) => {
  const query = `
    INSERT INTO players (id, name) 
    VALUES ($1, $2) 
    ON CONFLICT (id) DO UPDATE SET name = $2, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  const result = await pool.query(query, [playerId, playerName])
  return result.rows[0]
}

const fetchMatch = async (matchSlug) => {
  const query = `
    SELECT m.*, 
           json_build_object(
             'id', q.id,
             'title', q.title,
             'description', q.description,
             'image_url', q.image_url
           ) as quiz
    FROM matches m
    JOIN quizzes q ON m.quiz_id = q.id
    WHERE m.slug = $1
  `
  const result = await pool.query(query, [matchSlug])
  return result.rows[0] || null
}

const fetchMatchWithPlayers = async (matchSlug) => {
  const query = `
    SELECT m.*,
           json_build_object(
             'id', q.id,
             'title', q.title,
             'description', q.description,
             'image_url', q.image_url
           ) as quiz,
           COALESCE(
             json_agg(
               json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'score', mp.score,
                 'joined_at', mp.joined_at
               ) ORDER BY mp.joined_at
             ) FILTER (WHERE p.id IS NOT NULL),
             '[]'::json
           ) as players
    FROM matches m
    JOIN quizzes q ON m.quiz_id = q.id
    LEFT JOIN match_players mp ON m.id = mp.match_id
    LEFT JOIN players p ON mp.player_id = p.id
    WHERE m.slug = $1
    GROUP BY m.id, q.id
  `
  const result = await pool.query(query, [matchSlug])
  return result.rows[0] || null
}

const withdrawPlayerFromMatch = async (playerId, match) => {
  const query = `
    DELETE FROM match_players 
    WHERE match_id = $1 AND player_id = $2
    RETURNING *
  `
  const result = await pool.query(query, [match.id, playerId])
  return result.rows[0]
}

const ensurePlayerParticipation = async (player, match) => {
  const query = `
    INSERT INTO match_players (match_id, player_id, score) 
    VALUES ($1, $2, 0) 
    ON CONFLICT (match_id, player_id) DO UPDATE SET joined_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  const result = await pool.query(query, [match.id, player.id])
  return result.rows[0]
}

const submitAnswer = async (match, playerId, questionId, choiceId) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Check if choice is correct
    const choiceQuery = `
      SELECT c.is_correct, q.points 
      FROM choices c
      JOIN questions q ON c.question_id = q.id
      WHERE c.id = $1 AND q.id = $2
    `
    const choiceResult = await client.query(choiceQuery, [choiceId, questionId])
    
    if (choiceResult.rows.length === 0) {
      throw new Error('Invalid choice or question')
    }
    
    const isCorrect = choiceResult.rows[0].is_correct
    const points = isCorrect ? choiceResult.rows[0].points : 0
    
    // Get previous answer if exists to adjust score
    const prevAnswerQuery = `
      SELECT points_earned FROM answers
      WHERE match_id = $1 AND player_id = $2 AND question_id = $3
    `
    const prevAnswerResult = await client.query(prevAnswerQuery, [match.id, playerId, questionId])
    const prevPoints = prevAnswerResult.rows.length > 0 ? prevAnswerResult.rows[0].points_earned : 0
    const scoreDelta = points - prevPoints
    
    // Insert or update answer
    const answerQuery = `
      INSERT INTO answers (match_id, player_id, question_id, choice_id, is_correct, points_earned) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (match_id, player_id, question_id) 
      DO UPDATE SET 
        choice_id = $4,
        is_correct = $5,
        points_earned = $6,
        submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const answerResult = await client.query(answerQuery, [
      match.id,
      playerId,
      questionId,
      choiceId,
      isCorrect,
      points
    ])
    
    // Update player score with delta
    if (scoreDelta !== 0) {
      const scoreQuery = `
        UPDATE match_players 
        SET score = score + $1
        WHERE match_id = $2 AND player_id = $3
        RETURNING score
      `
      await client.query(scoreQuery, [scoreDelta, match.id, playerId])
    }
    
    await client.query('COMMIT')
    return answerResult.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

const fetchMatchAnswers = async (matchId) => {
  const query = `
    SELECT a.*,
           json_build_object(
             'id', p.id,
             'name', p.name
           ) as player,
           json_build_object(
             'id', q.id,
             'question_text', q.question_text
           ) as question,
           json_build_object(
             'id', c.id,
             'choice_text', c.choice_text,
             'is_correct', c.is_correct
           ) as choice
    FROM answers a
    JOIN players p ON a.player_id = p.id
    JOIN questions q ON a.question_id = q.id
    JOIN choices c ON a.choice_id = c.id
    WHERE a.match_id = $1
    ORDER BY a.submitted_at DESC
  `
  const result = await pool.query(query, [matchId])
  return result.rows
}

module.exports = {
  ensurePlayerExists,
  fetchMatch,
  fetchMatchWithPlayers,
  withdrawPlayerFromMatch,
  ensurePlayerParticipation,
  submitAnswer,
  fetchMatchAnswers
}
