# Database Documentation

This document provides comprehensive information about the Relationship OS database schema, patterns, and best practices.

## Architecture Overview

The system uses **Supabase (PostgreSQL)** with:
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Edge functions for AI processing triggers
- Automatic timestamping and user isolation

## Environment Management

### Database Instances
- **Production**: Live user data on Supabase Pro
- **Staging**: Pre-production testing environment
- **Development**: Local/branch development with migrations

### Migration Workflow
```bash
# Create new migration
TIMESTAMP=$(python3 -c 'import datetime; print(datetime.datetime.now().strftime("%Y%m%d%H%M%S"))')
touch "supabase/migrations/${TIMESTAMP}_migration_name.sql"

# Apply migrations
echo "Y" | supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

## Core Tables

### Users & Authentication
- `auth.users` - Supabase Auth user records
- `contacts` - User profiles and contact information (includes `is_self_contact` for user profiles)

### Artifact System
- `artifacts` - Universal timestamped relationship data
- `artifact_processing_config` - AI processing rules per artifact type
- AI processing status tracking: `pending → processing → completed → failed`

### Relationship Intelligence
- `contacts` - Contact profiles with professional/personal context
- `contact_emails` - Multiple email addresses per contact
- `loops` - POGs (giving) and Asks (receiving) relationship exchanges
- `suggestions` - AI-generated contact update suggestions

### Integrations
- `user_integrations` - Service connection status
- `calendar_sync_logs` - Google Calendar sync tracking
- `gmail_sync_state` - Email synchronization state
- `linkedin_sync_tracking` - LinkedIn data sync status

## Key Patterns

### Row Level Security (RLS)
All tables include `user_id` with RLS policies:
```sql
-- Standard RLS pattern
CREATE POLICY "Users can only access their own data" 
ON table_name FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);
```

### Artifact Processing Pipeline
1. Insert artifact with `ai_parsing_status = 'pending'`
2. Database trigger calls `parse-artifact` edge function
3. AI processing updates status and generates suggestions
4. Frontend displays results with action buttons

### Timestamping Convention
```sql
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

## Best Practices

### Migration Safety
- Always include `WHERE` clauses in UPDATE/DELETE statements
- Test on single records first with `LIMIT 1`
- Never use destructive operations without explicit approval
- Back up data before major schema changes

### Performance Optimization
- Index frequently queried columns (`user_id`, foreign keys)
- Use `SELECT` with specific columns, avoid `SELECT *`
- Leverage Supabase real-time for live updates

### Data Integrity
- Use foreign key constraints
- Implement proper validation at database level
- Maintain referential integrity across related tables

## AI Processing Configuration

The `artifact_processing_config` table defines:
- Which artifact types require AI processing
- Required fields for processing (content, transcription, metadata)
- Automatic processing triggers

Example configuration:
```sql
INSERT INTO artifact_processing_config (artifact_type, enabled, requires_content) 
VALUES ('voice_memo', true, true);
```

## Backup Strategy

### Production Backups
- **Primary**: Supabase Pro automated daily backups (7-day retention)
- **Secondary**: Weekly compliance backups via custom scripts
- **Pre-deployment**: Manual snapshots before major deployments

### Recovery Procedures
- Point-in-time recovery available through Supabase Pro
- Schema-only backups for development environment restoration
- Comprehensive backup monitoring and health checks

## Development Guidelines

### Schema Changes
1. Create migration file with descriptive name
2. Test migration on development database
3. Review migration in staging environment
4. Apply to production during maintenance window

### Type Safety
- Always regenerate TypeScript types after schema changes
- Use generated types consistently across application
- Validate database queries against current schema

### Access Patterns
- Use Supabase client with RLS enabled
- Implement proper error handling for database operations
- Leverage real-time subscriptions for live data updates

For detailed schema information, see the latest migration files in `supabase/migrations/`.