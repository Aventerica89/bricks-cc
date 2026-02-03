#!/bin/bash

echo "========================================="
echo "Vercel Environment Variables Setup"
echo "========================================="
echo ""
echo "⚠️  RECOMMENDED: Use Vercel Dashboard UI instead"
echo "   https://vercel.com/dashboard → Settings → Environment Variables"
echo ""
echo "This script will prompt Vercel CLI to ask for each value interactively."
echo "Your credentials will NOT be stored in shell history."
echo ""

# Check if npx is available (safer than global install)
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Use npx instead of global install
VERCEL_CMD="npx vercel"

# Login to Vercel first
echo "Step 1: Login to Vercel..."
$VERCEL_CMD login

echo ""
echo "Step 2: Link to your project..."
$VERCEL_CMD link

echo ""
echo "Step 3: Setting up environment variables..."
echo ""

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "✅ Generated ENCRYPTION_KEY (save this securely):"
echo "   $ENCRYPTION_KEY"
echo ""

# Get production URL (non-sensitive, ok to prompt)
read -p "Enter your production URL (e.g., https://your-app.vercel.app): " APP_URL

echo ""
echo "Setting environment variables..."
echo "Vercel CLI will prompt you for each value interactively."
echo "This prevents secrets from appearing in shell history."
echo ""

# Use vercel env add without piping - it will prompt interactively
echo "Setting ADMIN_PIN..."
$VERCEL_CMD env add ADMIN_PIN production preview development

echo ""
echo "Setting TURSO_DATABASE_URL..."
$VERCEL_CMD env add TURSO_DATABASE_URL production preview development

echo ""
echo "Setting TURSO_AUTH_TOKEN..."
$VERCEL_CMD env add TURSO_AUTH_TOKEN production preview development

echo ""
echo "Setting ENCRYPTION_KEY (paste the value shown above)..."
echo "Value: $ENCRYPTION_KEY"
$VERCEL_CMD env add ENCRYPTION_KEY production preview development

echo ""
echo "Setting NEXT_PUBLIC_APP_URL (enter: $APP_URL)..."
$VERCEL_CMD env add NEXT_PUBLIC_APP_URL production preview

echo ""
echo "Setting INTERNAL_API_URL (enter: $APP_URL)..."
$VERCEL_CMD env add INTERNAL_API_URL production preview development

echo ""
echo "Setting DB_SETUP_TOKEN (one-time database setup token)..."
echo "Generate a random token or use your ADMIN_PIN..."
$VERCEL_CMD env add DB_SETUP_TOKEN production

echo ""
echo "========================================="
echo "✅ Environment variables set successfully!"
echo "========================================="
echo ""
echo "IMPORTANT - Save these securely:"
echo "  ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""
echo "Next steps:"
echo "  1. Redeploy: npx vercel --prod"
echo "  2. Run database setup (see TROUBLESHOOTING.md)"
echo "  3. After setup, remove DB_SETUP_TOKEN from Vercel dashboard"
echo ""
