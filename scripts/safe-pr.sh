#!/bin/bash

# Safe PR creation script that enforces git flow
# Usage: ./scripts/safe-pr.sh [title] [body]

set -e

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Determine correct target branch based on git flow
if [[ $CURRENT_BRANCH == feature/* ]]; then
    TARGET_BRANCH="develop"
    echo "✅ Feature branch detected, targeting: $TARGET_BRANCH"
elif [[ $CURRENT_BRANCH == "staging" ]]; then
    TARGET_BRANCH="main"
    echo "✅ Staging branch detected, targeting: $TARGET_BRANCH"
elif [[ $CURRENT_BRANCH == "develop" ]]; then
    TARGET_BRANCH="staging"
    echo "✅ Develop branch detected, targeting: $TARGET_BRANCH"
else
    echo "❌ Unknown branch pattern: $CURRENT_BRANCH"
    echo "Expected: feature/*, develop, or staging"
    exit 1
fi

# Get title and body from arguments or prompt
TITLE="${1:-}"
BODY="${2:-}"

if [[ -z "$TITLE" ]]; then
    echo "📝 Enter PR title:"
    read -r TITLE
fi

if [[ -z "$BODY" ]]; then
    echo "📝 Enter PR body (optional):"
    read -r BODY
fi

# Create the PR with correct target
echo "🚀 Creating PR: $CURRENT_BRANCH → $TARGET_BRANCH"
echo "   Title: $TITLE"

if [[ -n "$BODY" ]]; then
    gh pr create --base "$TARGET_BRANCH" --title "$TITLE" --body "$BODY"
else
    gh pr create --base "$TARGET_BRANCH" --title "$TITLE"
fi

echo "✅ PR created successfully following git flow!"