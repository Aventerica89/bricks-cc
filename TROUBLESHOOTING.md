# Troubleshooting Guide

## "Failed to create lesson" Error

If you see this error when trying to create a lesson, it's most likely because **the database tables haven't been created yet** in your production Turso database.

### Quick Fix

Your Turso database needs to have the schema pushed to it. Here's how:

#### Option 1: Secure API Endpoint (Recommended)

**Prerequisites:**
- Set `DB_SETUP_TOKEN` environment variable in Vercel
- Redeploy your application

```bash
# Make POST request with your setup token
curl -X POST https://your-app.vercel.app/api/setup-database \
  -H "x-setup-token: YOUR_DB_SETUP_TOKEN"
```

**IMPORTANT: After setup, remove `DB_SETUP_TOKEN` from Vercel for security.**

#### Option 2: Via Turso Dashboard

1. **Go to Turso Dashboard**: https://turso.tech/app
2. **Select your database**
3. **Click "SQL Console"** or "Query"
4. **Copy and paste the SQL from** `setup-tables.sql` in your repository
5. **Execute the SQL**
6. **Refresh your app** and try creating a lesson again

#### Option 3: Using Turso CLI

```bash
# Install Turso CLI (if not already installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Run setup SQL
turso db shell your-database-name < setup-tables.sql
```

#### Option 4: Using Drizzle (Local Setup Required)

```bash
# Create .env.local with your production credentials
# NOTE: Use >> instead of > to avoid overwriting existing config
echo "TURSO_DATABASE_URL=your-production-url" >> .env.local
echo "TURSO_AUTH_TOKEN=your-production-token" >> .env.local

# Push schema
npm run db:push

# Or use the helper script
./push-db-schema.sh
```

---

## How to Check What Went Wrong

After the improved error handling is deployed, the error alert will show more details:

- **"Validation failed"** - Check that all required fields are filled
- **"Invalid JSON"** - Network or request formatting issue
- **"no such table: lessons"** - Database tables not created (see fixes above)
- **Connection error** - Check Turso credentials in Vercel environment variables

---

## Verifying Database Setup

After pushing the schema, verify it worked:

### Using Turso CLI:
```bash
turso db shell your-database-name "SELECT name FROM sqlite_master WHERE type='table'"
```

You should see:
- lessons
- lesson_scenarios
- agents
- agent_instructions
- build_sessions
- visual_comparisons
- content_assets
- (and other existing tables)

### Using Turso Dashboard:
1. Go to your database
2. Click "SQL Console"
3. Run: `SELECT name FROM sqlite_master WHERE type='table'`

---

## Other Common Issues

### PIN Not Working
- Check that `ADMIN_PIN` is set in Vercel environment variables
- Make sure you're using the exact PIN you configured (case-sensitive if using letters)
- Clear your browser cookies and try again

### Environment Variables Not Applied
- After adding/changing environment variables in Vercel, you MUST redeploy
- Go to Deployments → Click on latest → Redeploy

### Build Failing
- Check Vercel deployment logs for specific errors
- Ensure all required environment variables are set
- Common missing vars: `ADMIN_PIN`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`

---

## Need More Help?

1. **Check Browser Console** (F12 → Console tab) for detailed error messages
2. **Check Vercel Deployment Logs** for server-side errors
3. **Verify All Environment Variables** are set correctly in Vercel dashboard
4. **Test Locally** first with `.env.local` before deploying

---

## Database Schema Reference

The teaching system uses these tables:

- **lessons** - Main lesson catalog
- **lesson_scenarios** - Reference scenarios with before/after examples
- **agents** - AI agent configurations (Structure, CSS, Review, etc.)
- **agent_instructions** - Version-controlled instructions for agents
- **build_sessions** - Build attempts and results
- **visual_comparisons** - Screenshot comparisons with annotations
- **content_assets** - Uploaded files (screenshots, videos, etc.)
