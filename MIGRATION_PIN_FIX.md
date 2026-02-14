# Migration: Add PINs to Existing Matches

This migration script generates unique 4-digit PINs for all matches that don't have them.

## When to Run

Run this script if:
- You have existing matches in your database without PINs
- The admin panel shows "PIN: N/A" for some matches
- After upgrading to a version that includes the PIN feature

## How to Run

1. Make sure your database is running and environment variables are set
2. Run the migration script:

```bash
node update-match-pins.js
```

## What It Does

1. Finds all matches in the database where `pin` is NULL
2. Generates a unique 4-digit PIN (1000-9999) for each match
3. Updates the match records with the generated PINs
4. Ensures no duplicate PINs are created

## Expected Output

```
Checking for matches without PINs...
Found 3 matches without PINs. Generating...
✓ Added PIN 1234 to match: partida-demo
✓ Added PIN 5678 to match: quiz-teste
✓ Added PIN 9012 to match: partida-final
✓ Successfully added PINs to 3 matches!
```

If all matches already have PINs:
```
✓ All matches already have PINs. No updates needed.
```

## Notes

- The script is idempotent - it's safe to run multiple times
- PINs are unique and won't conflict with existing PINs
- New matches created after this migration will automatically receive PINs
