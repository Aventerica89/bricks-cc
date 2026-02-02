# Vercel Environment Variables Setup Guide

## Quick Setup (Recommended)

### Option 1: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Click on your `bricks-cc` project**
3. **Go to Settings → Environment Variables**
4. **Add each variable below** (click "Add" for each one)

#### Required Variables

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `ADMIN_PIN` | Your secure PIN | Use a strong PIN (4+ digits), NOT 1234 |
| `TURSO_DATABASE_URL` | `libsql://[your-db].turso.io` | Get from Turso dashboard |
| `TURSO_AUTH_TOKEN` | Your Turso token | Get from Turso dashboard |
| `ENCRYPTION_KEY` | Generate below | 64-character hex string |
| `NEXT_PUBLIC_APP_URL` | Your production URL | e.g., `https://bricks-cc.vercel.app` |
| `INTERNAL_API_URL` | Same as above | e.g., `https://bricks-cc.vercel.app` |

5. **Select all environments** for each variable:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. **Click "Save"** after adding each variable

7. **Redeploy** your application:
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"

---

## Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
openssl rand -hex 32
```

Copy the output and use it as your `ENCRYPTION_KEY`.

---

## Get Turso Database Credentials

If you don't have a Turso database yet:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create bricks-cc

# Get database URL
turso db show bricks-cc --url

# Create auth token
turso db tokens create bricks-cc
```

---

## Option 2: Via Vercel CLI

If you prefer using the CLI, run the setup script:

```bash
cd /home/user/bricks-cc
./setup-vercel-env.sh
```

This will:
1. Login to Vercel
2. Link your project
3. Prompt for values
4. Set all environment variables automatically

---

## Option 3: Manual CLI Setup

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add ADMIN_PIN
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add ENCRYPTION_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add INTERNAL_API_URL

# Deploy
vercel --prod
```

---

## Verify Setup

After adding environment variables and redeploying:

1. Visit your Vercel URL
2. You should see the landing page
3. Try accessing `/teaching` - it should redirect to PIN entry
4. Enter your PIN
5. You should see the teaching dashboard

---

## Troubleshooting

### Build fails with "ADMIN_PIN environment variable is required"

✅ **This is expected!** Your security fix is working correctly.

**Solution**: Add the `ADMIN_PIN` environment variable in Vercel settings (see above).

### Build fails with database errors

**Solution**: Verify your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct.

### Can't access teaching system

**Solution**: Make sure you set a strong `ADMIN_PIN` (not 1234) and remember it!

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` to git
- Use a strong PIN (not 1234, 0000, etc.)
- Keep your `ENCRYPTION_KEY` secure and backed up
- Rotate credentials periodically

✅ **Your app is now secure** with:
- No hardcoded credentials
- Timing-safe PIN comparison
- Input validation on all endpoints
- Secure ID generation
- Type-safe query parameters

---

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Make sure you're deploying the latest commit (`ff2622e`)
4. Check the commit includes all security fixes

Current branch: `claude/general-session-52gF2`
Latest commit: `ff2622e` - "security: Address remaining security issues from PR review"
