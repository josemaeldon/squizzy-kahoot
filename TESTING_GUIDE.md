# Testing Guide for PR: Fix TypeError and Add Admin Features

This guide provides instructions for testing all the changes made in this PR.

## Prerequisites

- PostgreSQL database running and configured
- Environment variables set correctly (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
- Node.js installed (>=16.x)
- Dependencies installed: `npm install`

## 1. Test PIN Migration

### Setup
```bash
# First, check if database is accessible
node -e "require('./api/_src/db').query('SELECT 1').then(() => console.log('✓ DB connected')).catch(e => console.error('✗ DB error:', e.message))"
```

### Run Migration
```bash
# Generate PINs for existing matches without them
node update-match-pins.js
```

### Expected Output
If matches need PINs:
```
Checking for matches without PINs...
Found 3 matches without PINs. Generating...
✓ Added PIN 1234 to match: partida-demo
✓ Added PIN 5678 to match: quiz-teste
✓ Added PIN 9012 to match: partida-final
✓ Successfully added PINs to 3 matches!
```

If all matches have PINs:
```
✓ All matches already have PINs. No updates needed.
```

### Verify
- Log in to admin panel
- Go to "Partidas" section
- Verify all matches show a 4-digit PIN (not "N/A")

## 2. Test Results Page (TypeError Fix)

### Test Case 1: Normal Flow
1. Create a match with a quiz that has questions
2. Join the match as a player
3. Wait for admin to start the match
4. Answer a question
5. Wait for results page
6. **Expected**: Results page loads without errors, showing question title and correct answers

### Test Case 2: Edge Case (No Question)
This is harder to test naturally, but the fix ensures:
- If `currentQuestion` is null/undefined, it shows "Carregando..." as the title
- If `choices` is missing, correctAnswers returns empty array
- No JavaScript errors in console

### Verify
- Open browser console (F12)
- Navigate through a quiz
- **Expected**: No errors like "undefined is not an object (evaluating 't.question.title')"

## 3. Test Finish Match Feature

### Setup
1. Log in as admin
2. Create a new match
3. Start the match

### Test Steps
1. Navigate to "Partidas" section
2. Find the started match
3. **Verify**: "⏹️ Finalizar Partida" button is visible (orange/warning color)
4. Click "Finalizar Partida"
5. Confirm the dialog
6. **Expected**: 
   - Success message appears
   - Match status changes to "Concluída"
   - "Finalizar Partida" button disappears
   - Match is marked as ended in database

### Database Verification
```sql
SELECT slug, status, started_at, ended_at 
FROM matches 
WHERE slug = 'your-match-slug';
```
Expected: `ended_at` should have a timestamp, `status` should be 'completed'

## 4. Test Remove Player Feature

### Setup
1. Log in as admin
2. Create a match and get players to join (at least 2-3 players)
3. Optionally start the match

### Test Steps
1. Navigate to "Partidas" section
2. Find a match with players
3. Click "👥 Jogadores" button
4. **Verify**: Modal opens showing:
   - Match title
   - List of all players with names and scores
   - "Remover" button for each player
5. Click "Remover" for one player
6. Confirm the dialog
7. **Expected**:
   - Success message appears
   - Player disappears from the list
   - Player count updates in match list
   - Modal remains open showing updated list

### Database Verification
```sql
SELECT mp.id, p.name, mp.score
FROM match_players mp
JOIN players p ON mp.player_id = p.id
WHERE mp.match_id = 'your-match-id';
```
Expected: Removed player should not appear in results

### Edge Cases
- Try removing all players
- Try clicking "Remover" multiple times quickly (should be prevented by confirmation)
- Close modal and reopen to verify changes persisted

## 5. Test UI Consistency

### Visual Checks
1. **Admin Panel - Partidas Section**
   - PINs display correctly (4-digit codes in monospace font with blue background)
   - Button layout is clean and not overlapping
   - "Finalizar Partida" button only shows for started, non-ended matches
   - "Iniciar Partida" button only shows for non-started matches

2. **Players Modal**
   - Modal is centered and responsive
   - Player list scrolls if many players
   - Player items have hover effect
   - Scores display correctly
   - "Remover" buttons are consistently styled

3. **Mobile Responsiveness**
   - Test on mobile viewport (Chrome DevTools)
   - Buttons should wrap appropriately
   - Modal should be readable on small screens

## 6. Test Error Handling

### Invalid Scenarios
1. **Finish Match**: Try to finish a match that doesn't exist (manually edit request)
   - Expected: 404 error with message
2. **Remove Player**: Try to remove a player that doesn't exist
   - Expected: 404 error with message
3. **Network Error**: Disconnect internet and try operations
   - Expected: Appropriate error messages in alerts

## 7. Regression Testing

Verify existing functionality still works:
- Creating new matches (should automatically get PINs)
- Joining matches via PIN
- Starting matches
- Quiz gameplay
- QR code generation
- Copying match URLs
- Deleting matches
- Creating/editing quizzes

## Success Criteria

All tests pass if:
- ✅ Migration runs successfully and PINs display correctly
- ✅ No TypeError in Results.vue during quiz gameplay
- ✅ Admin can finish matches successfully
- ✅ Admin can view and remove players from matches
- ✅ UI is clean and responsive
- ✅ Error handling works appropriately
- ✅ No regression in existing features
- ✅ No security vulnerabilities (CodeQL passed)

## Troubleshooting

### Database Connection Issues
```bash
# Check environment variables
echo $DB_HOST $DB_DATABASE $DB_USERNAME

# Test connection
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE -c "SELECT 1"
```

### API Endpoint Not Found (404)
- Check that server.js has been restarted after changes
- Verify the endpoint is registered in server.js
- Check the exact path in browser Network tab vs. code

### Console Errors
- Open browser DevTools (F12)
- Check Console and Network tabs
- Look for failed requests or JavaScript errors
