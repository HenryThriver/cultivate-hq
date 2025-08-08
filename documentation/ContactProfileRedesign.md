# Contact Profile Redesign Implementation Plan

## Executive Summary

Transform the contact profile page into a **"30-second relationship intelligence briefing"** that surfaces the right information at the right time, enabling meaningful connections and strategic relationship cultivation.

### Core Vision
Create an executive-appropriate relationship dossier that:
- Provides complete context within 30 seconds
- Surfaces actionable intelligence
- Tracks relationship health and reciprocity
- Enables network-aware relationship building
- Maintains sophisticated design with occasional surprising insights (85/15 rule)

## Architecture Decisions

### 1. Actions vs Loops
- **Actions** are the atomic units of work with status (queued, active, completed)
- **Artifacts** may have status (nullable) - only action-oriented artifacts use it
- **"Loops"** are a conceptual view of related actions, not a database entity

### 2. Artifact Status Clarification
- **Status-relevant artifacts**: POGs, Asks, Meetings (with follow-ups), Projects
- **Status-irrelevant artifacts**: Emails, LinkedIn posts, Podcasts, Voice memos
- **Implementation**: Status field remains nullable in database

### 3. Network Intelligence as First-Class Feature
- Track relationships between contacts
- Goal-specific targets for each contact
- Path-to-target calculations
- Introduction success tracking

## Database Schema Changes

### New Tables

#### 1. contact_relationships
```sql
CREATE TABLE contact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_a_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  contact_b_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('introduced_by_me', 'known_connection', 'target_connection')),
  strength TEXT CHECK (strength IN ('weak', 'medium', 'strong')),
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_a_id, contact_b_id)
);
```

#### 2. goal_contact_targets
```sql
CREATE TABLE goal_contact_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_description TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('introduction', 'information', 'opportunity', 'exploration')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'achieved', 'archived')) DEFAULT 'active',
  achieved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(goal_id, contact_id)
);
```

### Schema Updates

#### artifacts table
- Ensure `ai_parsing_status` allows null for non-parseable artifacts
- Add index on `contact_id, type, created_at` for timeline queries

## Component Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│         Contact Header + Suggestion Toast        │
│ Photo | Name/Title | RQ | Goals* | [Voice Memo] │
├─────────────────────────────────────────────────┤
│         Relationship Pulse Dashboard             │
│ Reciprocity | Cadence | Actions | Network: 12→  │
├─────────────────────────────────────────────────┤
│          Action Intelligence Center              │
│ Open Actions | Timing Opportunities | Next Best │
├─────────────────────────────────────────────────┤
│  Personal Intelligence  │  Professional Dossier  │
│  (Left Column)         │  (Right Column)        │
└─────────────────────────────────────────────────┘
    [Timeline] [Network] [Analytics] [Goals]
```

### New Components

#### 1. RelationshipPulseDashboard
**Purpose**: At-a-glance relationship health metrics
**Features**:
- Reciprocity balance visualization
- Connection cadence health (on-track/overdue)
- Open actions count with priority
- Network connections count
- Next interaction (scheduled or suggested)

#### 2. ActionIntelligenceCenter  
**Purpose**: Centralized action management for this contact
**Features**:
- Filtered view of all open actions
- Grouped by type (POG follow-ups, asks, general tasks)
- "Next best action" highlighting
- Quick status updates
- Timing opportunities (birthdays, milestones)

#### 3. NetworkVisualization
**Purpose**: Display contact's network and connection paths
**Features**:
- Connection map showing who this contact knows
- Introduction history
- Path to target contacts
- Connection strength indicators

#### 4. InlineEditableField
**Purpose**: Enable quick edits without leaving the page
**Features**:
- Click-to-edit functionality
- Auto-save with optimistic updates
- Change tracking (AI suggested vs manual)
- Undo/redo support

### Enhanced Components

#### ContactHeader (Enhanced)
**Changes**:
- RQ score as clickable pill (no trend)
- Voice Memo as primary CTA (visually prominent)
- Goal badges (multiple, colored for active, clickable)
- Integrated suggestion toast

#### Professional/Personal Context Displays
**Structure**:
- **Professional** (Right):
  - Three Horizons (Past/Present/Future)
  - Industry & expertise areas
  - Current projects
  - Professional aspirations
  - Conversation starters
  
- **Personal** (Left):
  - Family & life context
  - Values & interests
  - Personality profile
  - Important dates
  - Formative experiences

## Implementation Phases

### Phase 1: Core Structure (Week 1-2)
1. **Database Changes**
   - Create migrations for new tables
   - Update artifacts schema
   - Add necessary indexes

2. **Component Development**
   - Enhanced ContactHeader with Voice Memo prominence
   - RelationshipPulseDashboard component
   - ActionIntelligenceCenter component
   - Side-by-side context displays with inline editing

3. **State Management**
   - Implement optimistic updates
   - Local storage for view preferences
   - Real-time subscription updates

### Phase 2: Network Intelligence (Week 3-4)
1. **Network Features**
   - Contact relationships CRUD operations
   - NetworkVisualization component
   - Path-to-target calculations
   - Goal-contact targets management

2. **Enhanced Intelligence**
   - Connection cadence health calculations
   - Smart action recommendations
   - Bulk suggestion operations

3. **UI Polish**
   - Animations and transitions
   - Loading states
   - Error handling

### Phase 3: Advanced Features (Week 5-6)
1. **Analytics & Insights**
   - Pattern detection from timeline
   - Relationship insights
   - Network growth tracking

2. **Smart Features**
   - Personality profiling tools
   - Smart reminders from context
   - Conversation coach

3. **Testing & Refinement**
   - User testing
   - Performance optimization
   - Edge case handling

## Technical Specifications

### API Endpoints Needed
```typescript
// Network Intelligence
GET    /api/contacts/:id/relationships
POST   /api/contacts/:id/relationships
DELETE /api/relationships/:id

// Goal Targets
GET    /api/goals/:goalId/targets
POST   /api/goals/:goalId/targets
PUT    /api/goals/:goalId/targets/:targetId
DELETE /api/goals/:goalId/targets/:targetId

// Actions
GET    /api/contacts/:id/actions
PUT    /api/actions/:id/status
```

### State Management Strategy
- **Zustand stores**:
  - `useContactProfileStore` - UI state, view preferences
  - `useNetworkStore` - relationship data, calculations
  
- **TanStack Query**:
  - Contact data with real-time subscriptions
  - Network relationships
  - Goal targets
  - Actions with optimistic updates

### Performance Considerations
- Virtualize timeline for contacts with many artifacts
- Lazy load below-fold content
- Implement skeleton screens for perceived performance
- Debounce inline edit saves
- Cache network calculations

## Testing Strategy

### Unit Tests
- Component logic
- Network path calculations
- Date/cadence calculations
- State management

### Integration Tests
- Inline editing flow
- Action status updates
- Real-time updates
- Network visualization

### E2E Tests
- Complete contact viewing flow
- Edit and save operations
- Action management
- Goal target setting

## Success Metrics

### Quantitative
- Time to find key information: < 5 seconds
- Actions per visit: Increase by 40%
- Inline edit usage: >60% of profile updates
- Network feature adoption: >30% in first month

### Qualitative
- "Feels like having a relationship assistant"
- "I can prepare for any meeting in 30 seconds"
- "The network view changed how I think about relationships"

## Migration Guide

### For Existing Users
1. All current data preserved
2. New features progressively revealed
3. Onboarding tour for network features
4. Email announcement of new capabilities

### Database Migration Order
1. Create new tables (non-breaking)
2. Backfill any computed fields
3. Update application code
4. Remove deprecated fields (if any)

## Developer Notes

### Code Organization
```
src/
├── components/features/contacts/
│   ├── profile/
│   │   ├── ContactHeader.tsx
│   │   ├── RelationshipPulseDashboard.tsx
│   │   ├── ActionIntelligenceCenter.tsx
│   │   └── InlineEditableField.tsx
│   ├── network/
│   │   ├── NetworkVisualization.tsx
│   │   ├── ConnectionPath.tsx
│   │   └── RelationshipManager.tsx
│   └── goals/
│       ├── GoalTargetManager.tsx
│       └── TargetProgress.tsx
├── lib/hooks/
│   ├── useContactRelationships.ts
│   ├── useGoalTargets.ts
│   └── useActionIntelligence.ts
└── lib/services/
    ├── networkService.ts
    └── goalTargetService.ts
```

### Design System Alignment
- Follow Golden Ratio spacing (39px for premium content)
- Use color psychology (sage green for insights, amber for celebrations)
- Maintain executive magnetism aesthetic
- Implement 85/15 rule (professional/surprising)

### Accessibility Requirements
- All inline edits keyboard accessible
- ARIA labels for complex visualizations
- Focus management for modals
- High contrast mode support

## Next Development Session

1. Create feature branch: `git checkout -b feature/contact-profile-redesign`
2. Start with Phase 1 database migrations
3. Build RelationshipPulseDashboard component
4. Enhance ContactHeader with new design
5. Implement basic inline editing

---

*This document is a living guide. Update as implementation progresses and new insights emerge.*