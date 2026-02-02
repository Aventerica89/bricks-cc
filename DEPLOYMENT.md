# Deployment Guide - Bricks Builder Teaching System

## Vercel Deployment

### Prerequisites
1. Vercel account (https://vercel.com)
2. Turso database (https://turso.tech) or local SQLite for development

### Required Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database (Required)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Teaching System PIN (Required)
ADMIN_PIN=your-secure-4-digit-pin

# Application URLs (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
INTERNAL_API_URL=https://your-domain.vercel.app

# Security (Required for production)
ENCRYPTION_KEY=your-64-character-hex-key

# Optional: Claude AI Integration
CLAUDE_CLI_ENABLED=true

# Optional: Basecamp Integration
BASECAMP_ACCOUNT_ID=your_account_id
BASECAMP_OAUTH_TOKEN=your_oauth_token

# Optional: Bricks Builder API
BRICKS_API_KEY=your_default_api_key
```

### Step-by-Step Deployment

#### 1. Set up Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create a new database
turso db create bricks-teaching-system

# Get the database URL
turso db show bricks-teaching-system --url

# Create auth token
turso db tokens create bricks-teaching-system
```

#### 2. Push Database Schema

```bash
# Set environment variable
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Push schema to production database
npm run db:push
```

#### 3. Deploy to Vercel

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add ADMIN_PIN
vercel env add NEXT_PUBLIC_APP_URL
vercel env add INTERNAL_API_URL
vercel env add ENCRYPTION_KEY

# Trigger redeploy
vercel --prod
```

**Option B: Via GitHub Integration**

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

#### 4. Verify Deployment

1. Visit your Vercel URL
2. You should see the landing page
3. Click "Get Started"
4. Enter your ADMIN_PIN
5. Access the Teaching System

### Database Migrations

When you update the schema:

```bash
# Generate migration
npm run db:generate

# Review migration file in src/db/migrations/

# Push to production database
TURSO_DATABASE_URL="your-prod-url" TURSO_AUTH_TOKEN="your-token" npm run db:push

# Redeploy on Vercel
vercel --prod
```

### Security Considerations

1. **Change ADMIN_PIN**: Use a secure, unique PIN in production
2. **ENCRYPTION_KEY**: Generate with `openssl rand -hex 32`
3. **Database Access**: Keep TURSO_AUTH_TOKEN secret
4. **HTTPS**: Middleware enforces HTTPS in production automatically

### Troubleshooting

#### Build Fails with "TURSO_DATABASE_URL not set"

This is expected during build. The database connection is only used at runtime, not during build.

Solution: Vercel handles this automatically. Just ensure the env vars are set in Vercel dashboard.

#### "Invalid PIN" Error

1. Check ADMIN_PIN is set in Vercel environment variables
2. Clear browser cookies
3. Try incognito/private mode

#### Database Connection Errors

1. Verify TURSO_DATABASE_URL format: `libsql://your-db.turso.io`
2. Verify TURSO_AUTH_TOKEN is valid
3. Check Turso dashboard for database status
4. Run migrations: `npm run db:push`

#### Pages Not Loading / 404

1. Check Vercel deployment logs
2. Verify build succeeded
3. Check for middleware errors
4. Ensure all route files are committed to git

### Environment Variable Checklist

- [ ] TURSO_DATABASE_URL
- [ ] TURSO_AUTH_TOKEN (optional for local file DB)
- [ ] ADMIN_PIN
- [ ] NEXT_PUBLIC_APP_URL
- [ ] INTERNAL_API_URL
- [ ] ENCRYPTION_KEY (production only)

### Local Development

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
# For local dev, use file DB:
# TURSO_DATABASE_URL=file:./src/db/local.db

# Install dependencies
npm install

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

### Production Checklist

- [ ] Turso database created
- [ ] Database schema pushed
- [ ] All environment variables set in Vercel
- [ ] ADMIN_PIN changed from default
- [ ] ENCRYPTION_KEY generated
- [ ] Build passes (`npm run build`)
- [ ] Deployed to Vercel
- [ ] Landing page accessible
- [ ] PIN authentication working
- [ ] Teaching system accessible

---

## Alternative Deployments

### Railway

1. Create new project
2. Add PostgreSQL or use Turso
3. Set environment variables
4. Deploy from GitHub

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Self-Hosted (Docker)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t bricks-teaching .
docker run -p 3000:3000 --env-file .env.production bricks-teaching
```

---

## Support

For issues:
- Check build logs in Vercel dashboard
- Review Next.js error messages
- Verify all environment variables are set
- Check database connectivity
- Review GitHub issues: https://github.com/Aventerica89/bricks-cc/issues
