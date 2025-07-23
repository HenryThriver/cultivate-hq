# Vendor Documentation Reference

This document centralizes all vendor API documentation and CLI command references used in the Cultivate HQ project to prevent API/CLI command misuse and provide quick reference access.

## GitHub & Git

### GitHub CLI (gh)
- **Main Docs**: https://cli.github.com/manual/
- **PR Commands**: https://cli.github.com/manual/gh_pr
- **Workflow Commands**: https://cli.github.com/manual/gh_run
- **Secrets Management**: https://cli.github.com/manual/gh_secret

### GitHub Actions
- **Workflow Syntax**: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- **Environment Variables**: https://docs.github.com/en/actions/learn-github-actions/variables
- **Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

## Vercel

### Vercel CLI
- **Main Docs**: https://vercel.com/docs/cli
- **Deployment Logs**: https://vercel.com/docs/cli/logs
- **Environment Variables**: https://vercel.com/docs/cli/env
- **Project Configuration**: https://vercel.com/docs/projects/project-configuration

### Vercel Deployment
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs
- **Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Vercel.json Configuration**: https://vercel.com/docs/projects/project-configuration

## Supabase

### Supabase CLI
- **Main Docs**: https://supabase.com/docs/reference/cli
- **Database Management**: https://supabase.com/docs/reference/cli/supabase-db
- **Migrations**: https://supabase.com/docs/reference/cli/supabase-db-push
- **Type Generation**: https://supabase.com/docs/reference/cli/supabase-gen

### Supabase Platform
- **Database**: https://supabase.com/docs/guides/database
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Stripe Wrapper Extension**: https://supabase.com/docs/guides/database/extensions/wrappers/stripe
- **GitHub Integration & Branching**: https://supabase.com/docs/guides/deployment/branching/github-integration

## Node.js & Testing

### Vitest
- **CLI Commands**: https://vitest.dev/guide/cli.html
- **Configuration**: https://vitest.dev/config/
- **API Reference**: https://vitest.dev/api/

### Playwright
- **Test Runner**: https://playwright.dev/docs/test-cli
- **Configuration**: https://playwright.dev/docs/test-configuration
- **API Reference**: https://playwright.dev/docs/api/class-test

### NPM
- **CLI Commands**: https://docs.npmjs.com/cli/v10/commands
- **Scripts**: https://docs.npmjs.com/cli/v10/using-npm/scripts
- **Audit**: https://docs.npmjs.com/cli/v10/commands/npm-audit

## Payment Processing

### Stripe
- **API Documentation**: https://stripe.com/docs/api
- **Environment Variables**: https://stripe.com/docs/keys
- **Webhooks**: https://stripe.com/docs/webhooks
- **Node.js Library**: https://github.com/stripe/stripe-node

## AI & LLM Services

### Anthropic Claude
- **API Reference**: https://docs.anthropic.com/claude/reference
- **SDK Documentation**: https://github.com/anthropics/anthropic-sdk-typescript

### OpenAI
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Node.js Library**: https://github.com/openai/openai-node

## Google Services

### Google APIs
- **Calendar API**: https://developers.google.com/calendar/api
- **Gmail API**: https://developers.google.com/gmail/api
- **Authentication**: https://developers.google.com/identity/protocols/oauth2

### Google Cloud
- **Local Auth**: https://cloud.google.com/docs/authentication/provide-credentials-adc

## LinkedIn

### RapidAPI LinkedIn Services
- **LinkedIn Profile Scraper**: https://rapidapi.com/hub
- **API Documentation**: https://rapidapi.com/docs

## Next.js

### Next.js Framework
- **App Router**: https://nextjs.org/docs/app
- **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Configuration**: https://nextjs.org/docs/app/api-reference/next-config-js
- **Environment Variables**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

## Material-UI (MUI)

### Components & Theming
- **Component API**: https://mui.com/material-ui/api/
- **Theming**: https://mui.com/material-ui/customization/theming/
- **System**: https://mui.com/system/getting-started/

## Common CLI Command Patterns

### Vercel CLI Issues Experienced
- ❌ `vercel logs --follow=false cultivate-hq` (incorrect syntax)
- ✅ `vercel logs <deployment-url>` (correct syntax)
- ✅ `vercel logs <deployment-id>` (alternative correct syntax)

### NPM/Testing Issues Experienced  
- ❌ `npm run test -- --run` (incorrect Vitest syntax)
- ✅ `npx vitest run` (correct Vitest CLI usage)
- ✅ `npm run test --run` (alternative if script configured)

### GitHub CLI Patterns
- ✅ `gh pr checks <pr-number>` (check PR status)
- ✅ `gh run list --workflow="workflow-name.yml"` (list workflow runs)
- ✅ `gh pr view <pr-number> --comments` (view PR with comments)

### Supabase CLI Patterns (UPDATED 2025-07-20)
- ✅ `supabase gen types typescript --linked > src/lib/supabase/database.types.ts` (safe - generate types)
- ✅ `supabase projects list` (check current linked project - ALWAYS run first)
- ⚠️ `supabase db push --linked` (DANGEROUS - only for emergency manual operations)
- ❌ `npx supabase` (never use npx with Supabase - CLI installed globally)
- ❌ Direct production database operations during development (use GitHub integration instead)

### Supabase GitHub Integration Patterns (PREFERRED)
- ✅ Create feature branch with `supabase/` changes
- ✅ Push branch to trigger automatic database creation
- ✅ Check PR comments for Supabase preview environment URL
- ✅ Test migrations in isolated branch database
- ✅ Merge to main only after branch database validation
- ✅ `gh pr create` to trigger automated Supabase branch database
- ✅ `gh pr view <pr-number> --comments` to see Supabase preview environment details

### Critical Incident Resolution (2025-07-20)
**BEFORE** (Dangerous pattern that caused production incident):
- ❌ `supabase db push --linked` without checking environment
- ❌ Assuming manual staging workflow when GitHub integration was available
- ❌ No environment verification before database operations

**AFTER** (Current safe patterns):
- ✅ Always `supabase projects list` first to verify environment
- ✅ Use GitHub integration for ALL database changes
- ✅ Automated branch databases prevent production exposure
- ✅ Manual database operations only for emergency with explicit approval

### Supabase Environment Management (UPDATED 2025-07-20)
- **Environment Strategy**: https://supabase.com/docs/guides/deployment/managing-environments
- **GitHub Integration Strategy**: https://supabase.com/docs/guides/deployment/branching/github-integration
- **Automated Branch Databases**: GitHub integration creates isolated databases per feature branch
- **Environment Flow**: local → automated branch database → production (no manual staging needed)
- **Project Linking**: Only for emergency manual operations (avoid for development)
- ⚠️ `supabase db push --linked` (DANGEROUS - use only with explicit user approval for emergency fixes)
- ✅ `supabase gen types typescript --linked > src/lib/supabase/database.types.ts` (safe - only generates types)

### Supabase GitHub Integration Workflow (PREFERRED METHOD)
- **Automatic Branch Detection**: Supabase detects changes to `supabase/` directory in PRs
- **Isolated Database Creation**: Each feature branch gets its own database (e.g., `feature-stripe-abc123`)
- **Migration Application**: All migrations applied automatically to branch database
- **Preview Environment**: Vercel preview deployments connect to branch database
- **Safety**: Zero risk to production data during development and testing
- **Cleanup**: Branch databases automatically cleaned up when PR is closed/merged

### Supabase CI/CD Best Practices (UPDATED)
- **GitHub Integration First**: Always use automated branch databases for testing migrations
- **No Manual Staging**: Automated branch databases replace manual staging workflow
- **Migration Safety**: All migrations tested in complete isolation before production
- **Data Protection**: Branch databases start empty - no production data exposure
- **Database Safety**: Always use WHERE clauses for UPDATE/DELETE operations (still critical)
- **Emergency Manual Override**: Only use manual commands if GitHub integration fails

### Expected Supabase GitHub Integration Behavior
When a PR contains changes to `supabase/` directory:
1. **Automatic Detection**: Supabase GitHub integration detects changes
2. **Branch Database Creation**: Creates isolated database with pattern `feature-<branch>-<hash>`
3. **Migration Application**: Applies all migrations from `supabase/migrations/` to branch database
4. **Bot Comment**: `supabase[bot]` comments on PR with preview environment details
5. **GitHub Actions**: Our workflows validate the preview environment is ready
6. **Vercel Integration**: Preview deployments automatically use branch database URL

### Troubleshooting Supabase GitHub Integration
- **No bot comment after 5 minutes**: Check Supabase dashboard GitHub integration settings
- **Migration failures**: Check GitHub Actions logs and Supabase dashboard for error details  
- **Missing preview environment**: Verify `supabase/config.toml` exists and is properly configured
- **Wrong database connection**: Ensure Vercel preview deployments use branch-specific environment variables
- **Manual fallback**: Only use `supabase db push --linked` if GitHub integration is completely broken

## Quick Reference Notes (UPDATED 2025-07-20)

1. **Always check vendor CLI help first**: `<tool> --help` or `<tool> <command> --help`
2. **Consult this document after 2+ command failures** to find correct vendor documentation
3. **Update this document** when discovering new vendor API patterns or fixing command issues
4. **Environment variables** often follow vendor-specific naming conventions - check their docs
5. **Authentication patterns** vary significantly between vendors - reference their auth docs
6. **Supabase Safety Protocol**: Always run `supabase projects list` before ANY database operations
7. **GitHub Integration First**: Use automated branch databases instead of manual staging for Supabase
8. **Production Protection**: See CLAUDE.md for critical database safety protocols after 2025-07-20 incident

## Vendor-Specific Environment Variable Patterns

- **Vercel**: Uses `VERCEL_*` prefix for CLI tokens
- **Supabase**: Uses `SUPABASE_*` and `NEXT_PUBLIC_SUPABASE_*` patterns  
- **Stripe**: Uses `STRIPE_*` prefix, separate public/secret keys
- **Google**: Uses `GOOGLE_*` prefix, OAuth client patterns
- **Anthropic**: Uses `ANTHROPIC_API_KEY`
- **OpenAI**: Uses `OPENAI_API_KEY`
- **NextAuth**: Uses `NEXTAUTH_*` prefix for auth configuration

---

## Document History

- **2025-07-20**: Major update to Supabase patterns after critical production incident
  - Added GitHub integration workflow as preferred method
  - Updated environment management to reflect automated branch databases
  - Added safety protocols and incident resolution documentation
  - Marked manual database operations as dangerous/emergency-only