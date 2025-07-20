# CLAUDE.md

My name is Handsome Hank

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Development Server Management
npm run dev:clean    # Kill all instances and start fresh dev server
npm run dev:check    # Interactive port/process checker with options
npm run dev:kill     # Kill all Next.js development processes
npm run dev:ports    # Check which ports are occupied by development servers
```

### Database Operations
**CRITICAL: Never use npx with Supabase - CLI is installed globally**

```bash
# Environment Management - Production vs Staging
# Production project: zepawphplcisievcdugz (cultivate-hq)
# Staging project: oogajqshbhnjdrwqlffa (cultivate-hq-staging)

# Switch between environments
supabase link --project-ref zepawphplcisievcdugz                    # Link to production
supabase link --project-ref oogajqshbhnjdrwqlffa --password "..."   # Link to staging (requires password)

# Connect to database (established working pattern)
# Production
CONNECTION_STRING="postgresql://postgres.zepawphplcisievcdugz:fzm_BEJ7agw5ehz6tcj@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
# Staging  
CONNECTION_STRING_STAGING="postgresql://postgres:wxSdplHrc8NTvrZy@db.oogajqshbhnjdrwqlffa.supabase.co:5432/postgres"

# Common queries (use appropriate CONNECTION_STRING)
psql "$CONNECTION_STRING" -c "\dt"  # List tables
psql "$CONNECTION_STRING" -c "\d contacts"  # Describe table
psql "$CONNECTION_STRING" -c "SELECT id, name FROM contacts WHERE name ILIKE '%search%';"

# Migration workflow
TIMESTAMP=$(python3 -c 'import datetime; print(datetime.datetime.now().strftime("%Y%m%d%H%M%S"))')
touch "supabase/migrations/${TIMESTAMP}_migration_name.sql"
echo "Y" | supabase db push --linked  # Apply to currently linked project
supabase gen types typescript --linked > src/lib/supabase/database.types.ts

# CI/CD Migration Flow: GitHub Integration (MODERN APPROACH)
# GitHub integration creates automatic branch databases - no manual staging setup needed!
# 
# Workflow:
# 1. Create feature branch: git checkout -b feature/new-feature
# 2. Develop locally and create migration
# 3. Push branch: git push origin feature/new-feature
# 4. GitHub Actions automatically:
#    - Creates branch-specific Supabase database
#    - Applies all migrations to branch database
#    - Vercel preview deployment uses branch database
# 5. Merge to main: Applies migrations to production database
#
# Manual override (if needed):
# supabase link --project-ref zepawphplcisievcdugz && supabase db push --linked
```

### Development Workflow Best Practices

```bash
# Starting a new development session
npm run dev:ports    # Check what's currently running
npm run dev:clean    # Clean start if needed (kills all instances)

# Quick status check during development
npm run dev:check    # Interactive tool with options:
                     # - Show current processes
                     # - Kill specific processes
                     # - Start fresh server
                     # - Check port availability

# Ending development session
npm run dev:kill     # Kill all Next.js processes when done

# Common development issues
# - Port conflicts: Use npm run dev:clean to resolve
# - Multiple instances: Use npm run dev:check to manage
# - Auth context errors: Check .env.local for missing API keys
# - Build errors: Run npm run build to identify issues early
```

## Architecture Overview

**Cultivate HQ** is a comprehensive relationship intelligence system built around four core pillars: Strategic Connection Architecture, Proactive Relationship Nurturing, Strategic Ask Management, and Sustainable Systems Design.

### Core Architecture Patterns

#### Centralized Artifact Processing System
- **Configuration-Driven**: All AI processing rules in `artifact_processing_config` database table
- **Zero-Code Extensibility**: New artifact types require only database configuration
- **Unified Edge Function**: `parse-artifact` handles all artifact types with dynamic routing
- **Automatic Triggering**: Database triggers automatically call AI processing when `ai_parsing_status = 'pending'`

#### Universal Artifact Foundation
All relationship intelligence flows through timestamped artifacts:
- Voice memos, meetings, emails, LinkedIn posts/profiles
- Loop management (POGs and Asks) as special artifact types
- Consistent processing pipeline with AI suggestions
- Status tracking: pending → processing → completed

#### Edge Function Architecture
**CRITICAL**: Use unified processing pattern
- `parse-artifact` is the single edge function for ALL artifact AI processing
- Database triggers automatically call edge functions - don't invoke directly
- To reprocess: Set `ai_parsing_status = 'pending'` in database
- Internal routing based on artifact type and metadata

### Tech Stack

- **Framework**: Next.js 15 with App Router, TypeScript strict mode
- **Database**: Supabase (PostgreSQL with real-time subscriptions, RLS)
- **UI**: Material-UI v5 components + Tailwind CSS v4 for styling
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **External Integrations**: Gmail, Google Calendar, LinkedIn via APIs
- **AI Processing**: Anthropic Claude via edge functions

### Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── auth/               # Authentication pages
│   ├── api/                # API routes for integrations
│   └── onboarding/         # User onboarding flow
├── components/
│   ├── features/           # Domain-specific components
│   │   ├── contacts/       # Contact management
│   │   ├── loops/          # POG/Ask loop management
│   │   ├── timeline/       # Artifact timeline display
│   │   ├── suggestions/    # AI suggestion system
│   │   └── voice-memos/    # Voice recording
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── hooks/              # Custom React hooks
│   ├── services/           # External API integrations
│   ├── supabase/           # Database client & types
│   └── utils/              # Utility functions
└── types/                  # TypeScript definitions
```

### Key Domain Concepts

#### Artifacts
All relationship data stored as timestamped artifacts with unified AI processing:
- **Types**: voice_memo, meeting, email, linkedin_post, linkedin_profile, loop
- **Processing**: Automatic AI analysis with suggestions generation
- **Status Tracking**: pending → processing → completed with timestamps

#### Loops (POGs & Asks)
Special artifacts representing relationship exchanges:
- **POGs**: Packets of Generosity (giving value)
- **Asks**: Requests for help or resources
- **Status Lifecycle**: QUEUED → ACTIVE → PENDING → CLOSED
- **Ownership Tracking**: Whose turn it is to act

#### Contact Intelligence
Comprehensive relationship context:
- **Professional**: Role, company, expertise, career events
- **Personal**: Interests, family, milestones, conversation starters
- **Artifact Timeline**: All interactions chronologically organized
- **Reciprocity Dashboard**: Visual balance of giving/receiving

### Database Safety Rules

- **NEVER** run destructive operations without explicit user approval
- **ALWAYS** use WHERE clauses for UPDATE/DELETE operations
- **ALWAYS** test queries on single records first (add LIMIT 1)
- **NEVER** use `supabase db reset` or data-wiping commands
- **ALWAYS** follow Row Level Security patterns

### Code Conventions

#### TypeScript
- Use strict mode with proper type definitions
- Prefer `interface` over `type` for object shapes
- Always define return types for functions
- Use Supabase generated types

#### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

export const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // Hooks at top
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};
```

#### MUI + Tailwind Integration
- Use MUI components for structure (Box, Container, Typography)
- Use Tailwind for spacing, sizing, and custom styles
- Prefer MUI's sx prop over className when using MUI components

#### State Management
- Zustand for client-side state that persists across components
- TanStack Query for server state and caching
- Keep component state local when possible

### Import Patterns
- Group imports: React, third-party, internal components, utilities
- Use absolute imports with @ alias: `@/components`, `@/lib`, `@/types`
- Prefer named exports over default exports (except pages)

### Testing Approach
- Check existing patterns in the codebase before assuming test frameworks
- Search for test files or scripts in package.json to understand testing setup
- Write unit tests for utilities and hooks
- Test user interactions, not implementation details

### Vendor Documentation Reference
**IMPORTANT**: After 2+ failed attempts with vendor CLI commands or APIs, consult `documentation/VENDOR-DOCS.md` for correct syntax and documentation links. This prevents repeated API/CLI misuse (e.g., incorrect Vercel logs syntax, Vitest command patterns, etc.).