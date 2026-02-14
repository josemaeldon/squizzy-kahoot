# Database Migrations

This directory contains the database schema and migration system for Squizzy.

## Automatic Migrations

The application automatically runs database migrations on startup. This ensures your database is always up-to-date with the latest schema changes.

### How It Works

1. When the server starts, it runs the migration system before accepting requests
2. The system creates a `migrations` table to track which migrations have been applied
3. It runs migrations in order, skipping any that have already been applied
4. Only after all migrations complete successfully does the server start

### Migration Files

Migrations are defined in `migrations.js` and reference SQL files in this directory:

- **`schema.sql`** - Initial database schema (tables, indexes, functions, triggers)
- **`add-pin-column.sql`** - Adds PIN column to matches table
- **`seed.sql`** - Sample quiz data (optional, not run automatically)

### Adding New Migrations

To add a new migration:

1. Create a SQL file in this directory (e.g., `add-new-feature.sql`)
2. Add an entry to the `MIGRATIONS` array in `migrations.js`:

```javascript
{
  name: '003_add_new_feature',
  file: 'add-new-feature.sql',
  description: 'Add new feature to database'
}
```

3. The migration will automatically run on next deployment

### Migration Naming Convention

- Use sequential numbers: `001_`, `002_`, `003_`
- Use descriptive names: `initial_schema`, `add_pin_column`
- File names should match: `001_initial_schema` -> `schema.sql`

### Manual Migration (Optional)

To run migrations manually:

```bash
# Run all pending migrations
node migrate.js

# Or use the migration system directly
node database/migrations.js
```

### Best Practices

1. **Make migrations idempotent** - Use `IF NOT EXISTS`, `IF EXISTS`, etc.
2. **Never modify existing migrations** - Create new migrations instead
3. **Test migrations locally** before deploying
4. **Keep migrations small** - One logical change per migration
5. **Include rollback instructions** in comments if the migration is complex

### Troubleshooting

**Migration fails on startup:**
- Check the server logs for error messages
- Verify database connection settings
- Ensure PostgreSQL is running and accessible
- The server will exit with an error if migrations fail

**Need to re-run a migration:**
- Delete the entry from the `migrations` table:
  ```sql
  DELETE FROM migrations WHERE name = 'migration_name';
  ```
- Restart the server to re-run the migration

**Need to rollback a migration:**
- Manual rollback is required
- Write the reverse SQL commands
- Delete the migration entry from the `migrations` table
- Run your rollback SQL

### Migration Tracking

The system maintains a `migrations` table:

```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

To check which migrations have been applied:

```sql
SELECT * FROM migrations ORDER BY applied_at;
```
