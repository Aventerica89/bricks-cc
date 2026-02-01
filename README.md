# WP Manager + Claude AI Integration

A unified client management platform that integrates Claude AI, WordPress (via Bricks Builder), and Basecamp. Clients get a 24/7 AI assistant that can:

- Edit Bricks page layouts directly
- Answer project status questions
- Provide reminders and task management
- Submit feedback that syncs to Basecamp
- Access project information through natural conversation

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Claude Code CLI installed and authenticated
- Turso database account
- Basecamp account (optional)
- WordPress site with Bricks Builder (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/bricks-cc.git
cd bricks-cc
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
bricks-cc/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── chat/         # Chat endpoints
│   │   │   ├── bricks/       # Bricks API proxy
│   │   │   ├── basecamp/     # Basecamp integration
│   │   │   └── clients/      # Client management
│   │   └── dashboard/        # Admin dashboard
│   ├── components/           # React components
│   ├── lib/                  # Core utilities
│   ├── types/                # TypeScript definitions
│   ├── utils/                # Helper functions
│   └── db/                   # Database schema
├── wordpress-plugin/         # WordPress plugin
├── claude-scripts/           # CLI integration scripts
└── ...
```

## Features

### AI Chat Assistant

The chat widget provides 24/7 AI-powered support:
- Context-aware responses using project data
- Automatic action execution (page edits, todo creation)
- Conversation history persistence

### Bricks Builder Integration

Natural language page editing:
- "Make the heading bigger"
- "Change the button color to blue"
- "Add more padding to the hero section"

### Basecamp Sync

Bidirectional project management:
- Client feedback creates Basecamp todos
- Project status queries pull live data
- Webhook support for real-time updates

### WordPress Plugin

Embed the chat widget on client sites:
- Role-based access control
- Configurable positioning
- Automatic client identification

## Configuration

### Database (Turso)

1. Create a Turso database:
```bash
turso db create wp-manager
turso db tokens create wp-manager
```

2. Add credentials to `.env.local`:
```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

### Basecamp

1. Create a Basecamp app at https://launchpad.37signals.com/integrations
2. Get your OAuth token
3. Add to `.env.local`:
```
BASECAMP_ACCOUNT_ID=your_account_id
BASECAMP_OAUTH_TOKEN=your_token
```

### Bricks Builder

1. Enable REST API in Bricks settings
2. Create an API key or use WordPress application password
3. Configure per-site in the dashboard

## API Reference

### POST /api/chat

Send a chat message and receive AI response.

```typescript
// Request
{
  clientId: string;
  siteId: string;
  message: string;
  context?: {
    currentPageId?: number;
    basecampProjectId?: number;
  };
}

// Response
{
  response: string;
  actions?: Array<{
    type: 'bricks_edit' | 'basecamp_create_todo';
    payload: object;
    status: 'completed' | 'failed';
  }>;
  metadata: {
    tokensUsed?: number;
    executionTime: number;
  };
}
```

### POST /api/bricks/edit

Apply edits to Bricks page elements.

```typescript
// Request
{
  siteId: string;
  pageId: number;
  edits: Array<{
    elementId: string;
    property: string;
    value: any;
  }>;
}
```

### POST /api/feedback

Submit client feedback.

```typescript
// Request
{
  clientId: string;
  siteId: string;
  feedbackType: 'bug' | 'feature' | 'general';
  message: string;
}
```

## WordPress Plugin Installation

1. Copy the `wordpress-plugin` folder to your WordPress plugins directory:
```bash
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/claude-client-portal
```

2. Activate the plugin in WordPress admin

3. Configure in Settings > Claude Portal:
   - API URL: Your deployed application URL
   - Site ID: Your unique site identifier
   - Allowed Roles: Which users can see the chat widget

## Deployment

### Vercel

```bash
vercel deploy
```

### Self-Hosted

```bash
npm run build
npm run start
```

## Development

### Running locally

```bash
npm run dev
```

### Database migrations

```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Testing Claude CLI

```bash
echo "User: What's my project status?" | ./claude-scripts/process-chat.sh
```

## Security

- API keys are stored encrypted at rest
- Client authentication via WordPress sessions
- Role-based access control
- Input validation on all endpoints
- Rate limiting recommended for production

## License

MIT License - see LICENSE for details
