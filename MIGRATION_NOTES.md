# Migration from Sanity.io to PostgreSQL

This document describes the migration from Sanity.io to a self-hosted PostgreSQL solution.

## What Changed

### Before (Sanity.io)
- Cloud-hosted CMS backend
- Required Sanity.io account and API token
- External dependency for data storage
- Limited control over database schema
- API rate limits and quotas

### After (PostgreSQL)
- Self-hosted PostgreSQL database
- No external dependencies
- Full control over data and schema
- No rate limits or quotas
- Better privacy and data sovereignty

## Database Schema

### Tables Created
1. **quizzes** - Quiz metadata (title, description, image)
2. **questions** - Quiz questions with time limits and points
3. **choices** - Multiple choice answers with correct/incorrect flags
4. **matches** - Game sessions with status tracking
5. **players** - Player information
6. **match_players** - Player participation in matches with scores
7. **answers** - Player responses with automatic scoring

## API Changes

### Endpoints (No Changes)
The API endpoints remain the same:
- `POST /api/sign-up-player` - Register player
- `POST /api/submit-answer` - Submit answer
- `POST /api/withdraw-player` - Leave match
- `GET /api/ping` - Health check

### Request/Response Format Changes

#### submit-answer
**Before (Sanity.io):**
```json
{
  "playerId": "player-123",
  "matchSlug": "demo-match",
  "questionKey": "question-key-1",
  "selectedChoiceKey": "choice-key-a"
}
```

**After (PostgreSQL):**
```json
{
  "playerId": "player-123",
  "matchSlug": "demo-match",
  "questionId": "uuid-question-id",
  "choiceId": "uuid-choice-id"
}
```

Changed from `questionKey`/`selectedChoiceKey` to `questionId`/`choiceId` (UUIDs).

## Environment Variables

### Removed
- `SQUIZZY_WRITE_TOKEN` - Sanity.io API token

### Added
- `POSTGRES_HOST` - Database host
- `POSTGRES_PORT` - Database port (5432)
- `POSTGRES_DB` - Database name
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password

## Deployment

### Old Deployment (Vercel/Now)
```bash
now deploy
```

### New Deployment (Docker Swarm)
```bash
export POSTGRES_PASSWORD=secure-password
docker stack deploy -c docker-compose.yml squizzy
```

## Data Migration

If you have existing data in Sanity.io that you want to migrate:

1. Export data from Sanity.io using their API
2. Transform the data to match the PostgreSQL schema
3. Insert data using SQL scripts or database tools

Example export script (not included):
```javascript
// Export from Sanity
const quizzes = await sanityClient.fetch('*[_type == "quiz"]')
const questions = await sanityClient.fetch('*[_type == "question"]')
// ... etc

// Transform and insert into PostgreSQL
// ... transformation logic
```

## Benefits of Migration

1. **Self-Hosted** - Complete control over infrastructure
2. **No Vendor Lock-in** - Standard PostgreSQL database
3. **Cost Effective** - No API usage charges
4. **Better Privacy** - Data stays in your infrastructure
5. **Performance** - Direct database access
6. **Customization** - Full schema control

## Notes

- The Studio UI for managing quizzes is removed (was Sanity-specific)
- Quiz management now requires direct database access or custom admin UI
- Sample data is provided in `database/seed.sql`
- Database schema is automatically initialized on first startup
