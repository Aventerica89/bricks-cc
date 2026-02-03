#!/bin/bash

echo "========================================="
echo "Vercel Environment Variables Setup"
echo "========================================="
echo ""

# Login to Vercel first
echo "Step 1: Login to Vercel..."
vercel login

echo ""
echo "Step 2: Link to your project..."
vercel link

echo ""
echo "Step 3: Setting up environment variables..."
echo ""

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "Generated ENCRYPTION_KEY: $ENCRYPTION_KEY"

# Prompt for PIN
echo ""
read -p "Enter your ADMIN_PIN (secure 4+ digits): " ADMIN_PIN
read -p "Enter your TURSO_DATABASE_URL: " TURSO_DATABASE_URL
read -p "Enter your TURSO_AUTH_TOKEN: " TURSO_AUTH_TOKEN
read -p "Enter your production URL (e.g., https://your-app.vercel.app): " APP_URL

echo ""
echo "Setting environment variables for Production, Preview, and Development..."
echo ""

# Set ADMIN_PIN
echo "$ADMIN_PIN" | vercel env add ADMIN_PIN production
echo "$ADMIN_PIN" | vercel env add ADMIN_PIN preview
echo "$ADMIN_PIN" | vercel env add ADMIN_PIN development

# Set TURSO_DATABASE_URL
echo "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL production
echo "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL preview
echo "$TURSO_DATABASE_URL" | vercel env add TURSO_DATABASE_URL development

# Set TURSO_AUTH_TOKEN
echo "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN production
echo "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN preview
echo "$TURSO_AUTH_TOKEN" | vercel env add TURSO_AUTH_TOKEN development

# Set ENCRYPTION_KEY
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY production
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY preview
echo "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY development

# Set NEXT_PUBLIC_APP_URL
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL preview

# Set INTERNAL_API_URL
echo "$APP_URL" | vercel env add INTERNAL_API_URL production
echo "$APP_URL" | vercel env add INTERNAL_API_URL preview
echo "$APP_URL" | vercel env add INTERNAL_API_URL development

echo ""
echo "========================================="
echo "✅ Environment variables set successfully!"
echo "========================================="
echo ""
echo "Your ENCRYPTION_KEY (save this): $ENCRYPTION_KEY"
echo ""
echo "Next steps:"
echo "1. Redeploy your project: vercel --prod"
echo "2. Or deploy via Vercel dashboard"
echo ""
