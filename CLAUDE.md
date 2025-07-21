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

### Pre-Commit Quality Gates ⚡
**CRITICAL: Run these checks locally BEFORE pushing to PR to avoid wasting PR cycles**

```bash
# Complete Quality Gates verification (run ALL before pushing):

# 1. TypeScript compilation check
npx tsc --noEmit --project tsconfig.ci.json

# 2. ESLint check  
npm run lint

# 3. Next.js build check (catches Suspense, hydration, and build issues)
npm run build

# 4. Database migration validation (if migrations changed)
supabase start  # Ensure local database is running
supabase db push --local  # Test migrations locally first

# If ALL checks pass ✅, then push to PR:
git push origin feature/your-branch
```

**Why this matters:** These are the EXACT same checks that GitHub Actions Quality Gates run. Running them locally catches issues before they waste PR cycles and prevents frustrating build failures.

### Database Operations
**CRITICAL: PRODUCTION DATABASE PROTECTION - READ BEFORE ANY DATABASE OPERATIONS**

#### PRODUCTION SAFETY PROTOCOL ⚠️

**MANDATORY: Check environment BEFORE any database command**
```bash
# ALWAYS run this first - look for ● symbol
supabase projects list

# If ● is next to zepawphplcisievcdugz (production), STOP IMMEDIATELY!
# NEVER run database modifications on production directly
```

#### Environment Management
```bash
# Production project: zepawphplcisievcdugz (cultivate-hq) ⚠️ PROTECTED

# Link to staging for development work:
supabase link --project-ref oogajqshbhnjdrwqlffa --password "..."

# FORBIDDEN: Direct production linking for migrations
# supabase link --project-ref zepawphplcisievcdugz  # ❌ NEVER DO THIS FOR DEVELOPMENT
```

#### PREFERRED: CI/CD Migration Flow (GitHub Integration)
**Use this approach for ALL database changes**

```bash
# 1. Create feature branch (REQUIRED)
git checkout -b feature/your-feature

# 2. Create migration files locally (SAFE)
TIMESTAMP=$(python3 -c 'import datetime; print(datetime.datetime.now().strftime("%Y%m%d%H%M%S"))')
touch "supabase/migrations/${TIMESTAMP}_migration_name.sql"
# Edit the migration file with your changes

# 3. Commit and push (SAFE - triggers automated branch database)
git add supabase/migrations/ supabase/config.toml
git commit -m "feat: your database changes"
git push origin feature/your-feature

# 4. Supabase GitHub Integration automatically:
#    - Detects supabase/ directory changes
#    - Creates branch-specific Supabase database (e.g., feature-stripe-abc123)
#    - Applies all migrations to isolated branch database
#    - Posts preview environment URL as PR comment
#    - GitHub Actions validate the preview environment

# 5. Vercel preview deployment automatically uses branch database
# 6. Only after testing: merge to main applies to production

# VERIFICATION: Check PR comments for Supabase preview environment URL
```

#### Emergency Manual Migration (REQUIRES EXPLICIT APPROVAL)
```bash
# ONLY use if CI/CD is broken and user explicitly authorizes

# 1. VERIFY you're NOT on production:
supabase projects list  # Confirm ● is NOT next to zepawphplcisievcdugz

# 2. Apply migration:
echo "Y" | supabase db push --linked

# 3. Generate types:
supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

#### ABSOLUTE PROHIBITIONS ❌
```bash
# NEVER run these commands when linked to production:
supabase db push --linked           # ❌ Can corrupt production data
supabase db reset --linked          # ❌ Destroys production database
supabase db dump --linked --data    # ❌ Can impact production performance

# NEVER link to production for development:
supabase link --project-ref zepawphplcisievcdugz  # ❌ FORBIDDEN
```

#### AI Assistant Safety Rules
If you are Claude Code or any AI assistant:

1. **ALWAYS check `supabase projects list` BEFORE any database operation**
2. **NEVER run `supabase db push` unless user explicitly confirms current environment**
3. **ALWAYS prefer CI/CD workflow over direct database modifications**
4. **ASK user to confirm environment if unclear**
5. **REFUSE to execute database commands if linked to production without explicit user override**

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