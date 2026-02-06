# Quick Fix: Database Setup for Production

Your lessons are missing because the production database tables haven't been created yet.

## Option 1: Use Setup Endpoint (Fastest ⚡)

**Step 1:** Add temporary setup token to Vercel
1. Generate a secure random token:
   ```bash
   # On Linux/Mac:
   openssl rand -hex 32

   # On Windows (PowerShell):
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```
2. Go to: https://vercel.com/[your-team]/bricks-cc/settings/environment-variables
3. Add new variable:
   - **Name:** `DB_SETUP_TOKEN`
   - **Value:** Use the secure random token generated above
   - **Environments:** Production
4. Redeploy (or wait for auto-deploy)

**Step 2:** Run setup endpoint
```bash
curl -X POST https://bricks.jbcloud.app/api/setup-database \
  -H "x-setup-token: your-secure-random-token"
```

**Step 3:** Remove DB_SETUP_TOKEN
1. Go back to Vercel environment variables
2. Delete `DB_SETUP_TOKEN`
3. Redeploy

**Done!** Refresh https://bricks.jbcloud.app/teaching/lessons

---

## Option 2: Use Turso CLI

**Step 1:** Get your production database credentials
From Vercel Dashboard → Environment Variables:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

**Step 2:** Push schema to production
```bash
# Set environment variables (use your actual values)
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Push database schema
npm run db:push
```

**Done!** Tables are now created.

---

## Option 3: Manual SQL (Advanced)

If you have Turso CLI installed:
```bash
# Connect to your database
turso db shell your-database-name

# Run the migration files
.read src/db/migrations/0000_productive_wrecker.sql
.read src/db/migrations/0001_violet_iceman.sql
```

---

## Verify It's Working

1. Go to: https://bricks.jbcloud.app/teaching/lessons
2. You should see no more 500 errors
3. Try creating a new lesson - it should work!

---

## Still Having Issues?

Check Vercel logs for specific error messages:
https://vercel.com/[your-team]/bricks-cc/logs
