# Security Review Report
**Project:** bricks-cc (WP Manager + Claude AI Integration)
**Date:** 2026-02-01
**Reviewed By:** Claude Sonnet 4.5

---

## Executive Summary

Overall security posture: **MODERATE** ⚠️

The project demonstrates good security fundamentals in some areas but has **CRITICAL** gaps that must be addressed before production deployment. Key concerns include lack of authentication, missing CSRF protection, no rate limiting, and unencrypted API keys in the database.

**Risk Level:** HIGH for production use without remediation

---

## Critical Issues 🔴

### 1. No Authentication/Authorization System

**Severity:** CRITICAL
**Location:** All API endpoints (`src/app/api/**/route.ts`)
**Issue:** API endpoints accept `clientId` and `siteId` from request body without verification.

```typescript
// chat/route.ts - Anyone can impersonate any client
const { clientId, siteId, message } = validation.data;
// No check if the request actually comes from this client!
```

**Impact:**
- Any user can impersonate any client by guessing/enumerating client IDs
- Unauthorized access to chat history, feedback, Bricks edits
- Potential data breach of all client communications

**Recommendation:**
```typescript
// Add JWT/session authentication
import { verifySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await verifySession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify session.clientId matches request clientId
  if (session.clientId !== body.clientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Continue processing...
}
```

---

### 2. API Keys Stored in Plain Text

**Severity:** CRITICAL
**Location:** `src/db/schema.ts` - `basecampSync.apiToken`, `clientSites.bricksApiKey`
**Issue:** Sensitive API keys stored as plain text in database.

```typescript
// schema.ts line 65
apiToken: text("api_token"), // Should be encrypted in production
bricksApiKey: text("bricks_api_key"), // Plain text!
```

**Impact:**
- Database breach exposes all client API keys
- Basecamp and WordPress credentials compromised
- Lateral movement to client infrastructure

**Recommendation:**
```typescript
// Use encryption at rest
import { encrypt, decrypt } from '@/lib/crypto';

// Before storing
const encryptedToken = encrypt(apiToken);
await db.insert(basecampSync).values({ apiToken: encryptedToken });

// When retrieving
const decryptedToken = decrypt(syncConfig.apiToken);
```

**Implementation:**
```typescript
// lib/crypto.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

### 3. No CSRF Protection

**Severity:** CRITICAL
**Location:** All POST/PUT/DELETE endpoints
**Issue:** State-changing operations lack CSRF token validation.

**Impact:**
- Attackers can trick users into submitting feedback
- Unauthorized Bricks page edits via CSRF
- Cross-site request forgery attacks

**Recommendation:**
```typescript
// middleware.ts
import { csrf } from '@edge-csrf/nextjs';

const csrfProtect = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

export async function middleware(request: NextRequest) {
  const response = await csrfProtect(request);
  return response;
}
```

---

### 4. No Rate Limiting

**Severity:** HIGH
**Location:** All API endpoints
**Issue:** No protection against abuse or DoS attacks.

**Impact:**
- Unlimited Claude API calls = massive costs
- Database overload from spam requests
- Denial of service attacks

**Recommendation:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Chat endpoint: 10 requests per minute per client
export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:chat',
});

// Feedback: 5 per hour per client
export const feedbackLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:feedback',
});

// Usage in route
import { chatLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const identifier = getClientId(request); // From auth session
  const { success } = await chatLimiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Continue...
}
```

---

## High Priority Issues 🟠

### 5. Input Validation Using Manual Type Checking

**Severity:** HIGH
**Location:** `src/utils/validators.ts`
**Issue:** Manual validation instead of schema-based validation (Zod recommended).

**Current:**
```typescript
if (!req.clientId || typeof req.clientId !== "string") {
  return { valid: false, error: "clientId is required..." };
}
```

**Recommendation:**
```typescript
// Install zod: npm install zod
import { z } from 'zod';

const ChatRequestSchema = z.object({
  clientId: z.string().uuid(),
  siteId: z.string().uuid(),
  message: z.string().min(1).max(10000),
  context: z.object({
    basecampProjectId: z.number().optional(),
    currentPageId: z.number().optional(),
  }).optional(),
});

export function validateChatRequest(data: unknown) {
  try {
    const validated = ChatRequestSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid request' };
  }
}
```

**Benefits:**
- Type-safe validation
- Better error messages
- Automatic TypeScript type inference
- Email, URL, UUID validation built-in

---

### 6. Error Messages May Leak Information

**Severity:** MEDIUM
**Location:** Multiple API routes
**Issue:** Detailed error messages exposed to users.

```typescript
// chat/route.ts line 78
catch (error) {
  console.error("Chat API error:", error);
  return NextResponse.json(
    { error: "Failed to process message" }, // Generic ✓
    { status: 500 }
  );
}

// But in lib/bricks.ts line 46-49
throw new Error(
  `Bricks API error: ${response.status} ${response.statusText} - ${error}`
  // ↑ This could leak internal details
);
```

**Recommendation:**
- Log detailed errors server-side only
- Return generic messages to users
- Never expose stack traces or internal paths

---

### 7. WordPress Plugin Missing Nonce Verification

**Severity:** MEDIUM
**Location:** `wordpress-plugin/claude-client-portal.php`
**Issue:** Settings form lacks nonce verification (CSRF protection).

**Current:** Settings saved via `options.php` which handles nonces automatically ✓
**However:** No nonce verification documented for AJAX endpoints (if added later).

**Recommendation:**
```php
// When adding AJAX endpoints
add_action('wp_ajax_claude_chat_message', 'handle_chat_ajax');

function handle_chat_ajax() {
    check_ajax_referer('claude_chat_nonce', 'nonce');

    if (!current_user_can('read')) {
        wp_send_json_error('Unauthorized');
    }

    // Process request
}
```

---

## Medium Priority Issues 🟡

### 8. No Content Security Policy (CSP)

**Severity:** MEDIUM
**Location:** Next.js config
**Issue:** Missing CSP headers for XSS protection.

**Recommendation:**
```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://3.basecampapi.com;
  frame-ancestors 'none';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

### 9. Client-Side Exposure of Internal URLs

**Severity:** MEDIUM
**Location:** Chat execution uses `NEXT_PUBLIC_APP_URL`
**Issue:** Internal API calls from server-side code use public env var.

```typescript
// chat/route.ts line 97
const bricksResponse = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/bricks/edit`,
  // ↑ Should use internal URL, not public
```

**Recommendation:**
```typescript
// Use server-side only variable
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3000';

const bricksResponse = await fetch(
  `${INTERNAL_API_URL}/api/bricks/edit`,
  // Internal server-to-server call
);
```

---

### 10. SQL Injection Prevention - VERIFIED ✅

**Severity:** N/A (No issues found)
**Status:** SECURE
**Details:** Drizzle ORM used correctly throughout with parameterized queries.

```typescript
// All queries properly parameterized
const messages = await db.query.chatMessages.findMany({
  where: (msg, { and, eq }) =>
    and(eq(msg.clientId, clientId), eq(msg.siteId, siteId)),
  // ↑ Safe - uses parameterized queries
});
```

**No action needed.** ✅

---

### 11. XSS Protection - NEEDS IMPROVEMENT

**Severity:** MEDIUM
**Location:** `src/utils/validators.ts` has `sanitizeInput()` but not used consistently
**Issue:** HTML sanitization function exists but not enforced.

**Current:**
```typescript
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Basic escaping
}
```

**Not used in:**
- Chat messages before storage
- Feedback messages
- Claude responses (assumes Claude sanitizes - risky!)

**Recommendation:**
```typescript
// Install DOMPurify for server-side
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

// Use before storing or displaying
const sanitizedMessage = sanitizeHtml(message);
await db.insert(chatMessages).values({
  userMessage: sanitizedMessage,
  // ...
});
```

---

## Dependency Vulnerabilities 📦

**Status:** 4 moderate vulnerabilities found

```json
{
  "moderate": 4,
  "packages": ["esbuild", "drizzle-kit", "@esbuild-kit/*"]
}
```

**Issue:** `esbuild` vulnerability in `drizzle-kit` dependency.

**Advisory:** GHSA-67mh-4wv8-2f99
**Description:** esbuild enables any website to send requests to dev server and read responses
**CVSS Score:** 5.3 (Medium)
**Affected:** esbuild <=0.24.2

**Impact:** Development only (not production), but still a concern.

**Recommendation:**
```bash
# Update to latest drizzle-kit
npm install drizzle-kit@latest

# Or accept dev-only risk and document
echo "Dev dependency vulnerability - production safe" > .npmaudit
```

---

## Positive Findings ✅

### Secrets Management - GOOD
- No hardcoded secrets in source code ✓
- All secrets use environment variables ✓
- `.env` files properly gitignored ✓
- `.env.example` provided for setup ✓

### Database Security - GOOD
- Drizzle ORM used correctly ✓
- No raw SQL concatenation ✓
- Parameterized queries throughout ✓

### WordPress Plugin - MOSTLY GOOD
- Direct access prevention (`ABSPATH` check) ✓
- Capability checks (`manage_options`, `current_user_can`) ✓
- Settings sanitization via `esc_attr`, `esc_html` ✓
- Role-based access control implemented ✓

---

## Pre-Production Checklist

Before deploying to production, complete these tasks:

### Authentication & Authorization
- [ ] Implement JWT or session-based auth
- [ ] Add middleware to verify user identity
- [ ] Verify clientId/siteId ownership on all endpoints
- [ ] Implement admin vs client role separation

### Secrets & Encryption
- [ ] Encrypt API keys at rest (Basecamp, Bricks)
- [ ] Generate and secure ENCRYPTION_KEY
- [ ] Use httpOnly cookies for sessions
- [ ] Rotate all API keys/secrets before launch

### Request Security
- [ ] Add CSRF protection to all state-changing endpoints
- [ ] Implement rate limiting (Upstash Redis recommended)
- [ ] Add input validation with Zod
- [ ] Sanitize all user input with DOMPurify

### Network Security
- [ ] Configure Content Security Policy headers
- [ ] Add security headers (X-Frame-Options, etc.)
- [ ] Use internal URLs for server-to-server calls
- [ ] Enable HTTPS only in production

### Monitoring & Logging
- [ ] Set up error tracking (Sentry)
- [ ] Log security events (failed auth, rate limits)
- [ ] Never log sensitive data (tokens, passwords)
- [ ] Set up alerts for unusual activity

### Dependency Management
- [ ] Update drizzle-kit to fix esbuild vulnerability
- [ ] Enable Dependabot on GitHub
- [ ] Schedule monthly dependency audits
- [ ] Document acceptable dev-only risks

### Testing
- [ ] Write security tests (auth bypass, CSRF, XSS)
- [ ] Test rate limiting enforcement
- [ ] Verify encryption/decryption
- [ ] Penetration test before launch

---

## Recommended Next Steps

1. **Implement authentication system** (CRITICAL - 2-3 days)
   - Use NextAuth.js or custom JWT solution
   - Add session verification middleware
   - Update all endpoints

2. **Add rate limiting** (HIGH - 1 day)
   - Set up Upstash Redis
   - Implement per-client limits
   - Add monitoring

3. **Encrypt API keys** (CRITICAL - 1 day)
   - Create encryption utilities
   - Migrate existing keys
   - Update read/write logic

4. **Add CSRF protection** (HIGH - 0.5 days)
   - Install @edge-csrf/nextjs
   - Add middleware
   - Update forms

5. **Replace manual validation with Zod** (MEDIUM - 1 day)
   - Install zod
   - Rewrite validators
   - Add schema tests

---

## Security Score

| Category | Score | Status |
|----------|-------|--------|
| Secrets Management | 8/10 | Good ✅ |
| Input Validation | 6/10 | Needs Improvement ⚠️ |
| SQL Injection | 10/10 | Excellent ✅ |
| Authentication | 0/10 | Missing 🔴 |
| Authorization | 0/10 | Missing 🔴 |
| CSRF Protection | 0/10 | Missing 🔴 |
| Rate Limiting | 0/10 | Missing 🔴 |
| XSS Prevention | 5/10 | Partial ⚠️ |
| Error Handling | 7/10 | Good ✅ |
| Dependencies | 7/10 | Good ✅ |

**Overall Score: 43/100** ❌

**Production Ready:** NO - Critical issues must be resolved first.

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Drizzle ORM Security](https://orm.drizzle.team/docs/security)
- [WordPress Security Handbook](https://developer.wordpress.org/apis/security/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Prepared by:** Claude Sonnet 4.5
**Date:** 2026-02-01
