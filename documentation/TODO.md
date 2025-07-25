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