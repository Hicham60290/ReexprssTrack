# Database Migrations

This directory contains manual SQL migrations for the ReExpressTrack database.

## Applying Migrations

### Using psql

If you have direct access to the PostgreSQL database:

```bash
psql $DATABASE_URL -f migrations/add_tracking_17track_enabled.sql
```

### Using Docker

If your database is running in a Docker container:

```bash
docker exec -i <postgres-container-name> psql -U postgres -d reexpresstrack < migrations/add_tracking_17track_enabled.sql
```

### Using Prisma Studio

Alternatively, you can apply migrations using Prisma:

```bash
npm run prisma:migrate
```

## Available Migrations

### add_tracking_17track_enabled.sql

**Date**: 2025-10-31

**Description**: Adds the `tracking_17track_enabled` boolean field to the `packages` table. This field controls whether admin has enabled 17Track synchronization for a package.

**Changes**:
- Adds `tracking_17track_enabled` column (default: `false`)
- Adds index for performance
- Adds column comment for documentation

**Required for**: Two-step tracking validation system where clients can add tracking numbers but only admin can enable 17Track synchronization.

## Migration Status Tracking

To check which migrations have been applied, you can query the database:

```sql
-- Check if tracking_17track_enabled column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'packages' AND column_name = 'tracking_17track_enabled';
```

If the query returns a row, the migration has been applied successfully.
