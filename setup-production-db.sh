#!/bin/bash

echo "========================================="
echo "Production Database Setup"
echo "========================================="
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📡 Fetching production environment variables from Vercel..."
echo ""

# Get the production URL from Vercel
PROD_URL=$(vercel ls --prod 2>/dev/null | grep -oP 'https://[^\s]+' | head -1)

if [ -z "$PROD_URL" ]; then
    echo "⚠️  Could not auto-detect production URL"
    echo ""
    read -p "Enter your production URL (e.g., https://bricks-cc.vercel.app): " PROD_URL
fi

echo "Production URL: $PROD_URL"
echo ""
echo "🔧 Calling database setup endpoint..."
echo ""

# Call the setup endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" "$PROD_URL/api/setup-database")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Database setup successful!"
    echo ""
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo "❌ Database setup failed (HTTP $HTTP_CODE)"
    echo ""
    echo "$BODY"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure you've redeployed with the latest code"
    echo "  2. Check that TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in Vercel"
    echo "  3. Visit $PROD_URL/api/setup-database in your browser"
fi

echo ""
echo "========================================="
