#!/bin/bash

echo "========================================="
echo "Push Database Schema to Production"
echo "========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Create .env.local with your Turso credentials:"
    echo "  TURSO_DATABASE_URL=libsql://your-db.turso.io"
    echo "  TURSO_AUTH_TOKEN=your-token"
    echo ""
    exit 1
fi

# Source the environment variables
set -a
source .env.local
set +a

# Check if Turso variables are set
if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo "❌ Missing Turso credentials in .env.local"
    echo ""
    echo "Required variables:"
    echo "  TURSO_DATABASE_URL"
    echo "  TURSO_AUTH_TOKEN"
    echo ""
    exit 1
fi

echo "✅ Turso credentials found"
echo "📊 Database: $TURSO_DATABASE_URL"
echo ""

# Push schema to database
echo "Pushing schema to production database..."
npm run db:push

echo ""
echo "========================================="
echo "✅ Database schema updated!"
echo "========================================="
echo ""
echo "Your production database now has all tables:"
echo "  ✓ lessons"
echo "  ✓ lesson_scenarios"
echo "  ✓ agents"
echo "  ✓ agent_instructions"
echo "  ✓ build_sessions"
echo "  ✓ visual_comparisons"
echo "  ✓ content_assets"
echo "  ✓ (and other existing tables)"
echo ""
