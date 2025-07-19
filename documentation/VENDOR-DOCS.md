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

### Supabase CLI Patterns
- ✅ `supabase db push` (apply migrations)
- ✅ `supabase gen types typescript --linked` (generate types)
- ❌ `npx supabase` (never use npx with Supabase - CLI installed globally)

## Quick Reference Notes

1. **Always check vendor CLI help first**: `<tool> --help` or `<tool> <command> --help`
2. **Consult this document after 2+ command failures** to find correct vendor documentation
3. **Update this document** when discovering new vendor API patterns or fixing command issues
4. **Environment variables** often follow vendor-specific naming conventions - check their docs
5. **Authentication patterns** vary significantly between vendors - reference their auth docs

## Vendor-Specific Environment Variable Patterns

- **Vercel**: Uses `VERCEL_*` prefix for CLI tokens
- **Supabase**: Uses `SUPABASE_*` and `NEXT_PUBLIC_SUPABASE_*` patterns  
- **Stripe**: Uses `STRIPE_*` prefix, separate public/secret keys
- **Google**: Uses `GOOGLE_*` prefix, OAuth client patterns
- **Anthropic**: Uses `ANTHROPIC_API_KEY`
- **OpenAI**: Uses `OPENAI_API_KEY`
- **NextAuth**: Uses `NEXTAUTH_*` prefix for auth configuration