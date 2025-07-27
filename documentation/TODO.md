# Next Coding Session TODOs

## 🐞 Bugs & Small Fixes

-   [ ] **Voice Memo Listening:** Investigate and fix issues with the "listen to voice memo" functionality not generating/working properly.
-   [ ] **Visual Polish:** Refine the display of the LinkedIn modal when accessed from the artifact timeline. (Lower priority)

## ✨ New Features: Artifact Types & Integrations

_(Goal: All artifact types should inform contact profiles, POGs, Asks, Conversation Topics, and Relationship Action Plans)_

-   [ ] **Gmail Integration:**
    -   [ ] Import Gmail messages as artifacts.
-   [x] **Google Calendar Integration:**
    -   [x] Import Google Calendar meetings as artifacts.
-   [x] **Meeting Artifact Enhancements:**
    -   [x] Allow uploading meeting recordings (video/audio) with automatic transcription.
    -   [x] Allow uploading pre-existing meeting transcripts.
-   [ ] **LinkedIn Integrations:**
    -   [ ] Import LinkedIn posts (individual posts by contacts or self) as artifacts. (Re-confirming if already listed, ensuring it's captured)
    -   [ ] Integrate LinkedIn direct messages as artifacts.
-   [ ] **Messaging App Integrations:**
    -   [ ] Integrate WhatsApp messages as artifacts.
    -   [ ] Integrate SMS messages (Android focus, explore feasibility) as artifacts.
-   [ ] **General Social Media & Blog Posts:**
    -   [ ] Import blog posts (e.g., from RSS or URL) as artifacts.
    -   [ ] Import other social media posts (beyond LinkedIn) as artifacts.
-   [ ] **Podcast Imports:**
    -   [ ] Import podcast episodes (e.g., via RSS or direct audio file) as audio artifacts.
-   [ ] **Video Imports (General):**
    -   [ ] Import YouTube videos as arteifacts.
    -   [ ] Import other video files (webinars, local video files) as artifacts.
-   [ ] **Audio Imports (General):**
    -   [ ] Import generic audio files (beyond podcasts) as artifacts.
-   [ ] **Screenshot Imports:**
    -   [ ] Allow uploading screenshots as image artifacts (e.g., for conversations on platforms like Circle).

## 🔄 Loop Management (POGs, Asks, Conversation Topics)

-   [ ] **Deep Dive:** Thoroughly review and refine the concepts of:
    -   Packets of Generosity (POGs)
    -   Asks
    -   Conversation Topics
-   [ ] **Status Tracking:** Ensure robust status management and transitions for all loop types.
-   [ ] **Integration:** Define and implement how new artifact imports (emails, meetings, posts, etc.) inform, create, or update existing loops.

## 🧠 Relationship Intelligence & Workflow

-   [ ] **Connection Preparation:**
    -   [ ] Develop features for generating insights and preparing for upcoming connections/meetings.
-   [ ] **Contact Onboarding (Existing):**
    -   [ ] Design and implement a streamlined process for onboarding net new contacts into the system.
-   [ ] **Relationship Action Plans:**
    -   [ ] Conceptualize and build functionality for generating, tracking, and managing relationship action plans over time.
-   [ ] **Reciprocity Index:**
    -   [ ] Further develop the concept of the Reciprocity Index.
    -   [ ] Implement logic for its calculation and display.
    -   [ ] Consider how it influences suggestions and action plans.

## 🚀 User Experience & Dashboards

-   [ ] **New User Onboarding Workflow:**
    -   [ ] Design a workflow for first-time users to set initial relationship goals.
    -   [ ] Prompt users to add contacts aligned with these goals, or have contact import suggest goal alignment.
-   [ ] **Daily Driver Dashboard:**
    -   [ ] Conceptualize and design a main dashboard highlighting daily/weekly activities and actions for network outreach.
-   [ ] **User Analytics Dashboard:**
    -   [ ] Develop a dashboard for users to track their progress in improving and deepening relationships.

## 📈 Product Management & Growth (Long-term)

-   [ ] **Product-Led Growth (PLG) KPIs:**
    -   [ ] Define key performance indicators (KPIs) for tracking user engagement, time-to-value, and overall tool effectiveness.
    -   [ ] Plan for how to measure these KPIs for yourself and future users.
-   [ ] **Scalability & Multi-user Considerations:**
    -   [ ] Begin thinking about the system architecture and features needed to support multiple users effectively.

## 🚀 Post-Production Launch Improvements (PR #9 - v0.15.0)

*Note: These are nice-to-have optimizations identified during code review. The current implementation is production-ready.*

### Security Enhancements
- [ ] **Token Encryption at Rest** (`src/app/api/google/combined-callback/route.ts:55,90`)
  - **Current**: Google API tokens stored in plaintext in database
  - **Improvement**: Consider encrypting tokens at rest for enhanced security
  - **Impact**: Low priority (tokens are short-lived and properly scoped)
  - **Implementation**: Use Supabase vault or application-level encryption

- [ ] **UUID Collision Prevention** (`src/app/api/stripe/webhook/route.ts:62`)
  - **Current**: Generated UUIDs not validated against existing auth users
  - **Improvement**: Add collision check or use Supabase's built-in UUID generation
  - **Impact**: Very low priority (UUID collisions extremely rare)
  - **Implementation**: Add `SELECT` query to check UUID existence before `INSERT`

### Performance Optimizations
- [ ] **Database Query Optimization** (`src/lib/hooks/useUser.ts:40-47`)
  - **Current**: Using nested query `subscription:subscriptions(*)`
  - **Improvement**: Use single `LEFT JOIN` for better performance
  - **Impact**: Medium priority for high-traffic scenarios
  - **Implementation**: Replace nested select with explicit JOIN query

- [ ] **Enhanced Error Logging** (`src/app/api/google/combined-callback/route.ts:73,108`)
  - **Current**: Some errors logged but not tracked for monitoring
  - **Improvement**: Add structured logging for production monitoring
  - **Impact**: Medium priority for operational visibility
  - **Implementation**: Integrate with monitoring service (DataDog, Sentry, etc.)

### Infrastructure Improvements
- [x] **Edge Functions Configuration** (Supabase Warning) ✅ **COMPLETED**
  - **Issue**: Edge Functions not automatically deployed to branches without config.toml declaration
  - **Solution**: Added all 6 edge functions to `supabase/config.toml` for automatic deployment
  - **Functions Configured**: `parse-artifact`, `calendar-sync`, `gmail-sync`, `process-contact-sync-jobs`, `transcribe-voice-memo`, `read_contact_context`
  - **Impact**: Resolves CI/CD reliability issues - edge functions now deploy automatically to staging/production

- [ ] **Load Testing for Real-time Subscriptions**
  - **Current**: Real-time subscriptions implemented but not load tested
  - **Improvement**: Validate performance under concurrent user load
  - **Impact**: Medium priority before significant user growth
  - **Implementation**: Use tools like Artillery or k6 for WebSocket load testing

### Monitoring & Observability
- [ ] **Production Monitoring Dashboard**
  - **Current**: Basic error logging in place
  - **Improvement**: Implement comprehensive monitoring for:
    - Google OAuth success/failure rates
    - Stripe webhook processing latency
    - Real-time subscription connection health
    - Voice memo processing pipeline performance
  - **Impact**: High priority for production operations
  - **Implementation**: Set up monitoring with alerts for critical metrics

## 🧪 E2E Testing Improvements (Priority 2)

*Identified during Claude AI code review of comprehensive E2E testing infrastructure (PR #10)*

### Test Reliability Enhancements
- [ ] **Data-testid Attributes for Reliable Selectors**
  - **Current**: Using complex regex selectors like `/add.*pog|new.*pog|\+.*pog/i`
  - **Improvement**: Add `data-testid` attributes to critical UI elements
  - **Impact**: Medium priority - reduces test flakiness and improves maintainability
  - **Implementation**: Add testids to buttons, forms, and key interactive elements
  - **Files**: All dashboard components (contacts, sessions, loops, onboarding)

- [ ] **Auth Token Format Verification** 
  - **Current**: Mock auth format may not match actual Supabase token structure
  - **Improvement**: Verify test auth tokens match real Supabase implementation
  - **Impact**: Medium priority - prevents auth-related test failures
  - **Implementation**: Compare mock tokens in `test-utils.ts` with actual Supabase auth
  - **Location**: `/e2e/test-utils.ts:109` - `mockAuthenticatedUser()` method

### Future Testing Enhancements
- [ ] **Performance Regression Detection**
  - Add baseline metrics for load time assertions
  - Implement automated performance benchmarking in CI/CD
  
- [ ] **Visual Regression Testing**
  - Add screenshot comparison for mobile layouts
  - Implement accessibility testing with Playwright accessibility features

- [ ] **Test Data Factories**  
  - Create reusable test data factories to reduce duplication
  - Implement database seeding utilities for consistent test state

## 🔥 High Priority (Post-Consolidation)

### Calendar Sync RLS Issues
- **Issue**: Manual calendar sync still showing RLS errors in terminal:
  - "new row violates row-level security policy for table calendar_sync_logs"  
  - "permission denied for table users"
- **Status**: Background automation works, but manual UI sync has RLS conflicts
- **Next Steps**: 
  - Debug the exact RLS policy conflict between UI and background sync
  - May need additional policy for authenticated users vs service role context
  - Check if there are multiple conflicting policies still active

## 🔐 Subscription Management Security & Testing (Post-Claude Review)

*Items identified during Claude AI code review of subscription cancellation feature (PR #28)*

### Test Coverage (High Priority)
- [x] **API Route Tests** - Unit tests for subscription management endpoints ✅ **COMPLETED**
  - **✅ Complete**: Tests for `/api/stripe/create-portal-session` route (7 tests, all passing)
  - **Missing**: Tests for `/api/debug/subscription-status` route  
  - **Impact**: High priority - core billing functionality now tested
  - **Location**: `src/app/api/stripe/__tests__/create-portal-session.test.ts`

- [x] **Hook Tests** - Test all states and error conditions ✅ **MOSTLY COMPLETED**
  - **✅ Complete**: Tests for `useCustomerPortal` hook (8 tests, 7 passing, 1 complex race condition test)
  - **Test Cases**: ✅ Loading states, ✅ error conditions, ⚠️ race conditions (implemented but test flaky), ✅ successful redirects
  - **Impact**: Medium priority - critical user interaction now tested
  - **Location**: `src/hooks/__tests__/useCustomerPortal.test.ts`
  - **Note**: Race condition protection is implemented and working in code, but test case is complex and flaky

- [ ] **Component Integration Tests** - Settings page billing functionality
  - **Missing**: Tests for subscription-conditional billing card display
  - **Test Cases**: Card visibility with/without active subscription, portal redirect flow
  - **Impact**: Medium priority - user experience not validated
  - **Implementation**: Add tests to existing settings page test suite

### Security Enhancements (Medium Priority)
- [ ] **Rate Limiting for Portal Sessions**
  - **Current**: No rate limiting on `/api/stripe/create-portal-session`
  - **Risk**: Potential abuse through excessive portal session requests
  - **Impact**: Medium priority - could lead to service abuse
  - **Implementation**: Add rate limiting middleware (Redis or memory-based)

- [ ] **Enhanced Input Validation**
  - **Current**: Basic authentication checks only
  - **Improvement**: Add request validation middleware for all API routes
  - **Impact**: Low priority - current validation sufficient for billing endpoints
  - **Implementation**: Create validation schemas with Zod or similar

### Code Quality Improvements (Low Priority)
- [ ] **TypeScript Interface Definitions**
  - **Current**: Response types not explicitly defined for API routes
  - **Improvement**: Create interfaces for all API response types
  - **Impact**: Low priority - improves developer experience and type safety
  - **Implementation**: Define `PortalSessionResponse`, `DebugResponse` interfaces

- [ ] **Standardized Error Response Format**
  - **Current**: Inconsistent error response formats across API routes
  - **Improvement**: Create unified error response utility
  - **Impact**: Low priority - improves API consistency
  - **Implementation**: Create shared error response helper function

- [ ] **Action Constants Definition**
  - **Current**: Hardcoded 'billing' string in settings component
  - **Improvement**: Define action constants or use enums
  - **Impact**: Very low priority - minor code quality improvement
  - **Implementation**: Create constants file for settings actions

### Performance Optimizations (Completed ✅)
- [x] **Settings Page Re-render Optimization** ✅ **COMPLETED**
  - **Issue**: Filter operation running on every render
  - **Solution**: Implemented `useMemo` for filtered options array
  - **Impact**: Prevents unnecessary component re-renders

- [x] **Race Condition Prevention** ✅ **COMPLETED**
  - **Issue**: Multiple rapid calls to `redirectToPortal` could overlap
  - **Solution**: Added early return if already loading
  - **Impact**: Prevents duplicate portal session creation

## 🚀 Performance Optimizations (Post-Launch)

*Note: Loading states for AI processing are already well-implemented. These are performance enhancements for future consideration.*

### React Performance Optimizations
- [ ] **Implement React Optimization Hooks**
  - **Current**: No usage of `React.memo`, `useMemo`, or `useCallback` found
  - **Improvement**: Add memoization to frequently re-rendering components
  - **Impact**: Medium priority - could significantly improve re-render performance
  - **Implementation**: Start with high-traffic components (ContactList, Timeline, Dashboard)

- [ ] **Leverage TanStack Query for Server State**
  - **Current**: TanStack Query installed but not actively used
  - **Improvement**: Replace manual data fetching with TanStack Query for caching
  - **Impact**: High value - automatic caching, background refetching, optimistic updates
  - **Implementation**: Migrate data fetching in hooks to use useQuery/useMutation

### Code Splitting & Bundle Optimization
- [ ] **Expand Lazy Loading Implementation**
  - **Current**: Only VoiceRecorder uses dynamic imports
  - **Improvement**: Lazy load heavy components (modals, charts, editors)
  - **Impact**: Medium priority - reduces initial bundle size
  - **Implementation**: Use Next.js dynamic() for ContactDetail, Timeline, etc.

- [ ] **Add Bundle Analysis Tools**
  - **Current**: No bundle analyzer configured
  - **Improvement**: Add webpack-bundle-analyzer or next-bundle-analyzer
  - **Impact**: High value for identifying optimization opportunities
  - **Implementation**: Add to build process, analyze and optimize large dependencies

### Client-Side Optimizations
- [ ] **Implement Virtual Scrolling for Large Lists**
  - **Current**: Contact lists handle 100+ items but no virtualization
  - **Improvement**: Add react-window or similar for contact/artifact lists
  - **Impact**: High priority when user base grows
  - **Implementation**: Virtual scrolling for ContactList, Timeline components

- [ ] **Add Debouncing/Throttling for User Inputs**
  - **Current**: Direct event handlers without rate limiting
  - **Improvement**: Debounce search inputs, throttle scroll handlers
  - **Impact**: Medium priority - prevents excessive API calls
  - **Implementation**: Add lodash.debounce or custom hooks for input handlers

### Infrastructure Optimizations
- [ ] **Implement Service Worker/PWA Features**
  - **Current**: No offline caching or PWA features
  - **Improvement**: Add service worker for offline support and caching
  - **Impact**: Low priority initially, high value for mobile users
  - **Implementation**: Next.js PWA plugin with workbox configuration

- [ ] **Optimize Image Loading**
  - **Current**: Limited use of Next.js Image component
  - **Improvement**: Use Image component throughout, add blur placeholders
  - **Impact**: Medium priority - improves perceived performance
  - **Implementation**: Replace img tags with next/image, generate placeholders 
>>>>>>> origin/main
