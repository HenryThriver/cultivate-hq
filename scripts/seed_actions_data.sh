#!/bin/bash

# Script to apply actions table migration and seed dummy data
# Run this from the project root directory

echo "🚀 Setting up Actions table and seed data..."

# Apply the actions table migration
echo "📊 Applying actions table migration..."
supabase db push --local

# Apply the main seed data (if not already applied)
echo "🌱 Applying main seed data..."
supabase db seed --local

# Apply the actions seed data
echo "⚡ Applying actions seed data..."
psql -h localhost -p 54322 -U postgres -d postgres -f ./supabase/seed_actions.sql

echo "✅ Actions table and seed data setup complete!"
echo ""
echo "📊 Summary of created actions:"
echo "  🎁 5 POG actions (deliver content, make introductions, share resources)"
echo "  🙋 2 Ask/Follow-up actions (follow up on requests and discussions)"
echo "  📝 3 Meeting actions (add notes from recent meetings)"
echo "  🔄 2 Follow-up actions (reconnect and schedule meetings)"
echo "  👥 2 Contact actions (add contacts to goals)"
echo ""
echo "🎯 Actions are linked to:"
echo "  • 3 Active goals (AI/ML Network, Board Positions, AI Ethics)"
echo "  • 4 Key contacts (Sarah, Marcus, Jennifer, Dr. Patel)"
echo "  • Relevant artifacts (voice memos, meetings, LinkedIn data)"
echo ""
echo "🌟 Now you can test the enhanced dashboard session area!"