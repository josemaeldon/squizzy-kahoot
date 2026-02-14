# Database Migration Guide

## Adding PIN Column to Matches Table

This migration adds a 4-digit PIN column to the `matches` table to allow players to join matches using a PIN code.

### For New Installations

If you're setting up Squizzy for the first time, the PIN column is already included in the schema. No migration is needed - just run the setup process as usual.

### For Existing Installations

If you already have a running Squizzy installation, you need to run the migration to add the PIN column:

#### Option 1: Using the Migration Script (Recommended)

```bash
node migrate.js
```

This script will:
- Check if the PIN column already exists
- Add the column if it doesn't exist
- Create the necessary index

#### Option 2: Manual SQL Execution

If you prefer to run the migration manually, execute the SQL from `database/add-pin-column.sql`:

```sql
ALTER TABLE matches ADD COLUMN IF NOT EXISTS pin VARCHAR(4) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_matches_pin ON matches(pin);
COMMENT ON COLUMN matches.pin IS '4-digit PIN code for joining the match';
```

### After Migration

Once the migration is complete:

1. Restart your Squizzy server
2. New matches created in the admin panel will automatically get a PIN
3. Players can join matches using the PIN from the home page
4. The QR code display will show both the QR code and the PIN

### Troubleshooting

**Error: "column 'pin' already exists"**
- This means the migration has already been run. No action needed.

**Error: "relation 'matches' does not exist"**
- Run the full database setup first: Visit `/setup` in your browser

**Migration script fails to connect to database**
- Check your `.env` file has the correct database connection details
- Ensure PostgreSQL is running
- Verify the database exists

### Rollback (if needed)

If you need to remove the PIN column:

```sql
DROP INDEX IF EXISTS idx_matches_pin;
ALTER TABLE matches DROP COLUMN IF EXISTS pin;
```

Note: This will remove all PIN data from existing matches.
