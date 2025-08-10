# Goals Dashboard & Individual Goal Pages Implementation Plan

> **Status**: In Development  
> **Created**: 2025-08-10  
> **Last Updated**: 2025-08-10  
> **Owner**: Handsome Hank  

## Executive Summary

Transform the current basic goals page into a comprehensive goal-oriented networking dashboard with individual goal detail pages. This system will enable users to manage multiple professional ambitions, track progress through relationship-building actions, and maintain momentum toward their objectives through clear visualization and task management.

## Core Philosophy

This is a **goal-oriented networking app** where we:
- Set targets for ourselves (ambitions)
- Identify people who can help us achieve those ambitions
- Build relationships systematically with those people
- Track progress through actions, milestones, and reciprocity
- Maintain motivation through clear progress indicators

## Current State

### Existing Infrastructure
- ✅ **Goals table** with support for multiple goals, milestones, and progress tracking
- ✅ **Actions table** that can relate to goals, contacts, and artifacts
- ✅ **Artifacts system** where POGs and asks are stored with directionality and loop status
- ✅ **Goal-contact associations** with relevance scoring
- ✅ **Basic goals page** at `/dashboard/goals` with card display
- ✅ **Onboarding goal workflow** with voice memo integration

### Current Limitations
- ❌ Limited progress visualization (only contact-based)
- ❌ No individual goal detail pages
- ❌ No action management within goal context
- ❌ No ask/POG tracking per goal
- ❌ No milestone management UI

## Implementation Phases

## Phase 1: Enhanced Goals Dashboard Page (`/dashboard/goals`)

### 1.1 Enhanced Goal Cards
**Objective**: Transform basic goal cards into comprehensive status tiles

#### Quick Stats Display (per goal)
- **Contacts Count**: Number of associated contacts
- **Open Actions**: Query `actions` table where `goal_id = goal.id AND status IN ('pending', 'in_progress')`
- **Completed Asks**: Query `artifacts` where `type='ask' AND goal_id AND loop_status='closed'`
- **Progress Percentage**: Calculated from multiple factors:
  ```
  progress = (
    (contacts_connected / target_contacts) * 0.3 +
    (actions_completed / total_actions) * 0.3 +
    (milestones_completed / total_milestones) * 0.4
  )
  ```

#### Visual Design Updates
- Vertical layout with more space per goal (limit 5-7 goals per user)
- Progress visualization beyond linear bar (consider circular progress or multi-metric display)
- Status badges (active/paused/completed/archived) with color coding
- Quick action buttons: "Add Action", "Add Contact", "View Details"
- Hover states showing additional details

### 1.2 Add New Goal Workflow
**Objective**: Modal-based multi-step goal creation

#### Step 1: Goal Category Selection
```typescript
const GOAL_CATEGORIES = [
  { display: 'Land a specific role or make a career transition', value: 'career_transition' },
  { display: 'Grow or launch my startup', value: 'startup' },
  { display: 'Nurture previous and prospective clients/customers', value: 'client_relationships' },
  { display: 'Find investors or strategic partners', value: 'investors_partners' },
  { display: 'Break into a new industry or market', value: 'industry_expansion' },
  { display: 'Learn a new skill or find a new mentor', value: 'learning_mentorship' },
  { display: 'Maintain or deepen relationships within an existing community', value: 'community_deepening' },
  { display: 'Something else', value: 'other' }
];
```

#### Step 2: Goal Details
- Title (required)
- Description (optional, with voice memo option)
- Timeline (3 months, 6 months, 1 year, custom)
- Success criteria (text or voice memo)
- Target metrics (optional):
  - Target contact count
  - Target action count
  - Key milestones

#### Step 3: Initial Setup (Optional)
- Associate existing contacts
- Create initial milestones
- Set first actions

## Phase 2: Individual Goal Pages (`/dashboard/goals/[id]`)

### 2.1 Goal Detail Header
**Component**: `GoalDetailHeader.tsx`

```typescript
interface GoalHeaderData {
  goal: Goal;
  stats: {
    contactsCount: number;
    actionsOpen: number;
    actionsCompleted: number;
    asksOpen: number;
    asksCompleted: number;
    pogsDelivered: number;
    progressPercentage: number;
  };
}
```

Features:
- Goal title, description, timeline display
- Edit mode for goal details
- Status management dropdown (active/paused/completed/archived)
- Progress visualization with multiple metrics
- Target date countdown

### 2.2 Actions Management Section
**Component**: `GoalActionsManager.tsx`

Features:
- **Actions List View**:
  - Filter: All / Pending / In Progress / Completed
  - Sort: Priority / Due Date / Created Date
  - Bulk actions: Mark complete, reassign priority
  
- **Add Action Form**:
  ```typescript
  interface GoalAction {
    title: string;
    description?: string;
    action_type: ActionType;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    due_date?: Date;
    contact_id?: string;
    estimated_duration_minutes?: number;
  }
  ```

- **Action Cards Display**:
  - Title and description
  - Associated contact (if any)
  - Due date with visual urgency indicators
  - Quick complete checkbox
  - Edit/Delete actions

### 2.3 Asks & POGs Section
**Component**: `GoalLoopsManager.tsx`

#### Asks Management
- **Two-column layout**: Open Asks | Completed Asks
- **Add Ask Form**:
  ```typescript
  interface GoalAsk {
    content: string;
    contact_id: string;
    impact_score?: number;
    is_milestone?: boolean;
    notes?: string;
  }
  ```
- **Ask lifecycle**: queued → active → pending → closed
- **Milestone flag** for important asks

#### POGs Management
- Similar structure to Asks
- **POG brainstorming** feature
- **Delivery tracking**
- **Impact scoring**

#### Reciprocity Balance
- Visual balance indicator
- Trend over time
- Suggestions for balance

### 2.4 Contacts Section
**Component**: `GoalContactsManager.tsx`

Features:
- **Contact Grid/List View**:
  - Profile picture, name, company, title
  - Relationship type badge
  - Relevance score indicator
  - Last interaction date
  
- **Add Contact to Goal**:
  - Search existing contacts
  - Define relationship type
  - Set relevance score
  - Add notes about how they help

- **Bulk Actions**:
  - Send update to multiple contacts
  - Schedule check-ins
  - Export contact list

### 2.5 Milestones & Progress
**Component**: `GoalMilestonesTracker.tsx`

Features:
- **Milestone Timeline View**:
  - Visual timeline with milestone markers
  - Progress indicators
  - Target vs actual dates
  
- **Add Milestone Form**:
  ```typescript
  interface GoalMilestone {
    title: string;
    description?: string;
    target_date?: Date;
    is_milestone_ask?: boolean;
    associated_ask_id?: string;
  }
  ```

- **Progress Calculation**:
  - Weight different factors
  - Show contribution of each factor
  - Predict completion date

## Phase 3: Navigation & Integration

### 3.1 Navigation Updates
- **Routes Structure**:
  ```
  /dashboard/goals                 - Goals dashboard
  /dashboard/goals/new             - Create new goal
  /dashboard/goals/[id]            - Goal detail page
  /dashboard/goals/[id]/edit       - Edit goal
  /dashboard/goals/[id]/actions    - Focus view on actions
  /dashboard/goals/[id]/contacts   - Focus view on contacts
  ```

- **Breadcrumb Navigation**:
  ```
  Dashboard > Goals > [Goal Title] > Actions
  ```

- **Goal Switcher**: Dropdown in header for quick goal switching

### 3.2 Cross-Feature Integration

#### Contact Pages Integration
- Show "Associated Goals" section on contact detail pages
- Quick add contact to goal from contact page
- Filter timeline by goal context

#### Timeline Integration
- Add goal filter to timeline
- Show goal association on artifact cards
- Create artifacts with goal context

#### Dashboard Widgets
- "Goal Progress Summary" widget
- "Today's Goal Actions" widget
- "Recent Goal Milestones" widget

## Phase 4: Advanced Features

### 4.1 Goal Analytics
**Component**: `GoalAnalyticsDashboard.tsx`

Metrics:
- Progress trends over time (line chart)
- Contact growth rate
- Action completion velocity
- Ask/POG balance history
- Milestone completion rate
- Predicted completion date

### 4.2 Goal Management Features

#### Goal Completion Flow
- Celebration screen with metrics summary
- Reflection prompts (what worked, what didn't)
- Archive or convert to maintenance mode
- Generate completion report

#### Goal Templates
```typescript
interface GoalTemplate {
  name: string;
  category: string;
  suggested_milestones: string[];
  suggested_timeline: string;
  suggested_actions: string[];
  typical_contact_types: string[];
}
```

#### Goal Collaboration (Future)
- Share goal progress with accountability partner
- Public goal pages (optional)
- Team goals for organizations

## Technical Implementation

### Database Schema Updates
No schema changes needed - leverage existing tables:
- `goals` - Core goal data
- `goal_contacts` - Goal-contact associations
- `goal_milestones` - Milestone tracking
- `actions` - Action items with goal_id
- `artifacts` - POGs/Asks with goal association

### API Endpoints

#### Goals API
```typescript
// Existing endpoints to enhance
GET    /api/goals              - List user goals with stats
POST   /api/goals              - Create new goal
GET    /api/goals/[id]         - Get goal with full details
PUT    /api/goals/[id]         - Update goal
DELETE /api/goals/[id]         - Archive/delete goal

// New endpoints needed
GET    /api/goals/[id]/stats   - Get comprehensive goal statistics
POST   /api/goals/[id]/actions - Add action to goal
POST   /api/goals/[id]/contacts - Associate contact with goal
POST   /api/goals/[id]/milestones - Add milestone to goal
```

### State Management
- Use Zustand for goal selection state
- TanStack Query for data fetching and caching
- Optimistic updates for status changes
- Real-time subscriptions for collaborative features

### Performance Optimizations
- Lazy load goal details on card expansion
- Virtualize long lists (contacts, actions)
- Implement pagination for historical data
- Cache goal stats with 5-minute TTL
- Use database indexes on frequently queried fields

## UI/UX Considerations

### Design System Alignment
- Follow existing MUI + Tailwind patterns
- Use established color schemes for status
- Maintain consistent spacing and typography
- Implement responsive breakpoints

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly progress indicators
- High contrast mode support

### Mobile Experience
- Touch-friendly action buttons
- Swipe gestures for status changes
- Collapsed views for mobile screens
- Bottom sheet modals for forms

## Success Metrics

### User Engagement
- Goals created per user
- Actions completed per week
- Goal detail page views
- Milestone completion rate

### System Performance
- Page load time < 1s
- API response time < 200ms
- Real-time update latency < 500ms

### Business Impact
- User retention improvement
- Feature adoption rate
- User satisfaction scores
- Goal completion rates

## Dependencies

### External
- Existing authentication system
- Supabase database and real-time
- AI processing for suggestions

### Internal
- Artifact processing system
- Contact management features
- Timeline component

## Risks & Mitigations

### Risk 1: Data Volume
**Risk**: Large number of actions/contacts per goal impacts performance
**Mitigation**: Implement pagination and virtualization early

### Risk 2: Complex Progress Calculation
**Risk**: Progress calculation becomes slow with multiple factors
**Mitigation**: Cache calculations, use database views

### Risk 3: Feature Adoption
**Risk**: Users don't understand goal-oriented approach
**Mitigation**: Strong onboarding, tooltips, sample goals

## Open Questions

1. Should we limit the number of active goals per user?
2. How do we handle goal dependencies (goal A must complete before goal B)?
3. Should goals have privacy settings (private/team/public)?
4. How do we handle recurring goals (quarterly OKRs style)?
5. Should we integrate with external goal tracking tools?

## Next Steps

1. ✅ Document implementation plan
2. ⬜ Review with team and gather feedback
3. ⬜ Create detailed component specifications
4. ⬜ Begin Phase 1 implementation
5. ⬜ Set up tracking for success metrics

---

## Change Log

### 2025-08-10
- Initial plan created
- Defined four implementation phases
- Established technical architecture
- Set success metrics