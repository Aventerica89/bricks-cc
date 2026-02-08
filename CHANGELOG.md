# Changelog

All notable changes to the Bricks Builder Teaching System are documented here.

## [Unreleased] - 2026-02-08

### New Features

- **Site Management**: Full CRUD for client sites — add, edit, and delete sites directly from the client detail page. API keys are encrypted at rest and masked in the UI with status badges.
- **Live Chat Integration**: Chat page now connects to real client sites instead of a hardcoded demo. Single sites auto-select; multiple sites show a dropdown picker.
- **Bricks Page Browser**: Bricks management page dynamically loads sites and fetches pages for sites with API keys configured. Warns when keys are missing.
- **Build Session Results**: Session cards are now clickable to view past build results.
- **Platform Landing Page**: Full rewrite of the landing page with platform overview, feature highlights, and clear navigation.
- **Connection Status Indicators**: Dashboard sidebar shows live connection status pills for configured integrations.
- **Settings Persistence**: Settings page now saves to the database with full Basecamp OAuth flow.
- **Instructions Manual**: In-app help modal accessible from the dashboard.
- **Build Output Polish**: Copy and download actions for build output, plus a dashboard activity feed.

### Improvements

- Replaced Claude CLI with Anthropic SDK for the structure agent (faster, more reliable)
- Better error details in OAuth callback for debugging
- Replaced broken `primary-*` color classes across the UI

### Fixes

- OAuth callback now surfaces detailed error messages
- Agent timeout cleanup runs in `finally` block to prevent leaks
- EchoAgent constructor type signature corrected

---

## [1.0.0] - 2026-02-08

### Teaching System

- **MVP Teaching System**: Visual lesson builder with scenario management
- **Individual Lesson Pages**: View and manage lessons with detailed scenario breakdown
- **AI Structure Agent**: Generates Bricks component structures from ACSS patterns using Anthropic SDK
- **BaseAgent Framework**: Extensible agent base class with confidence scoring, telemetry, and timeout handling

### Plugins & Integrations

- **Changelog Generator**: Auto-generates changelogs from git history with categorization
- **Context7 Docs Fetcher**: Pulls external documentation for reference during builds
- **ACSS MCP Server Reference**: Integration docs for the ACSS documentation MCP server

### Client Management

- **Client CRUD API**: Create, read, update, soft-delete clients with email validation
- **Chat Interface**: AI-powered chat with message history, action indicators, and retry
- **Feedback System**: Submit and track client feedback with Basecamp sync
- **Bricks Page Cache**: Fetch and cache Bricks page structures per site

### Security

- AES-256-GCM encryption for API keys and Basecamp tokens at rest
- CSRF protection on all mutating API endpoints
- In-memory rate limiting on API routes
- Zod schema validation replacing manual validators
- HTTPS enforcement with HSTS headers
- DOMPurify for XSS sanitization
- Timing-safe PIN comparison for authentication
- Security headers in Next.js configuration

### Infrastructure

- **Database**: Turso (LibSQL) with Drizzle ORM, one-click setup endpoint, CLI scripts, and SQL migration files
- **Deployment**: Vercel with production domain, environment variable helpers, and Edge Runtime compatibility
- **Health Check**: Monitoring endpoint with database connectivity verification
- **Next.js 16**: Migrated to proxy convention with proper Node.js runtime for API routes

### Documentation

- CLAUDE.md project guidelines for AI-assisted development
- Deployment guide and troubleshooting
- Security review report with implementation results
- Session progress tracking for development continuity
