# Bricks Builder Teaching System - Claude Code Instructions

## Project Overview

This is a Next.js 16 application that teaches AI agents to build Bricks Builder components using structured lessons and scenarios. The system analyzes ACSS (Automatic CSS) patterns and generates proper Bricks component structures.

## Core Architecture

### Technology Stack
- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript (strict mode)
- **Database**: Turso (LibSQL) with Drizzle ORM
- **AI**: Claude API via Anthropic SDK
- **Authentication**: PIN-based with timing-safe comparison
- **Deployment**: Vercel

### Key Components
1. **Teaching System**: Lessons → Scenarios → Training Data
2. **Agent System**: Structure → CSS → Review → Reference agents
3. **Build System**: Multi-phase generation and validation
4. **Content Library**: ACSS videos, Frames blocks, documentation

## Development Workflow

### Commit Convention (REQUIRED)
All commits MUST follow Conventional Commits:

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
chore(scope): maintenance tasks
refactor(scope): code refactoring
test(scope): add or update tests
perf(scope): performance improvements
```

**Scopes**: `agents`, `bricks`, `teaching`, `api`, `ui`, `db`, `docs`, `build`

### Changelog Generation (AUTOMATIC)

**CRITICAL RULE**: Every commit MUST have a corresponding changelog entry.

After EVERY push to a feature branch:
1. Auto-generate changelog entry using git history
2. Categorize changes: Features, Fixes, Enhancements, Security, Breaking Changes
3. Include: Description, affected files, technical details, user impact
4. Store in `docs/changelogs/changelog-[date].md`
5. Update `CHANGELOG.md` with latest entries

**Changelog Entry Format**:
```markdown
## [Date] - [Category]

### [Change Type]
**Description**: User-facing description of the change
**Technical Details**: Implementation specifics
**Files Affected**: List of modified files
**Migration Required**: Yes/No + steps if needed
**Related Issues**: #123, #456
```

### Small Chunk Philosophy

**ALWAYS work in small, reviewable chunks:**
- Maximum 100-200 lines per chunk
- One focused change per PR
- Complete tests for each chunk
- Documentation updates included
- Changelog entry generated

### Bot Review Process

After EVERY commit and push:
1. Wait for Gemini Code Assist review (~2-3 minutes)
2. Wait for Cubic Dev AI review (~2-3 minutes)
3. Address ALL concerns raised by bots
4. Fix issues in a new commit
5. Push fixes and wait for re-review
6. Repeat until all checks pass

**DO NOT proceed to next chunk until all bot reviews are clean.**

## Code Standards

### TypeScript Patterns
```typescript
// Use strict types
interface AgentInput {
  description: string;
  acssDump: Record<string, unknown>;
  constraints?: string[];
}

// Leverage Zod for validation
const inputSchema = z.object({
  description: z.string().min(1),
  acssDump: z.record(z.unknown()),
  constraints: z.array(z.string()).optional(),
});

// Infer types from Zod schemas
type ValidatedInput = z.infer<typeof inputSchema>;
```

### Error Handling
```typescript
// Custom error class with proper stack traces
class AgentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AgentError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Always provide recovery guidance
throw new AgentError(
  'ACSS_PARSE_ERROR',
  'Failed to parse ACSS dump',
  { line: 42, char: 15 },
  true
);
```

### Agent Development Pattern
```typescript
// All agents extend BaseAgent
abstract class BaseAgent {
  abstract execute(input: unknown): Promise<AgentOutput>;

  protected calculateConfidence(output: unknown): number {
    // Standard confidence calculation
  }

  protected logExecution(result: AgentOutput): void {
    // Telemetry and debugging
  }
}

// Concrete agent implementation
class StructureAgent extends BaseAgent {
  async execute(input: StructureInput): Promise<StructureOutput> {
    // 1. Validate input
    // 2. Analyze patterns
    // 3. Generate structure
    // 4. Calculate confidence
    // 5. Log execution
    return output;
  }
}
```

## File Organization

```
src/
├── lib/
│   ├── agents/           # AI agent implementations
│   ├── bricks/           # Bricks component logic
│   ├── plugins/          # Reusable plugin systems
│   ├── teaching/         # Teaching system utilities
│   └── content/          # Content management
├── app/
│   ├── api/              # API routes
│   ├── teaching/         # Teaching UI pages
│   └── build/            # Build system pages
├── components/           # React components
│   ├── teaching/         # Teaching-specific
│   └── build/            # Build system components
└── docs/
    └── changelogs/       # Auto-generated changelogs
```

## Security Guidelines

### Environment Variables
- NEVER commit real credentials
- Use placeholders in `.env.example` and `.env.vercel`
- Generate unique tokens (use `openssl rand -hex 32`)
- NO credential reuse across systems

### API Security
- Validate ALL inputs with Zod
- Sanitize generated code before execution
- Rate limit agent endpoints
- Encrypt sensitive agent configurations

### Authentication
- PIN-based access for teaching system
- Timing-safe comparison for PIN validation
- HTTPS enforcement in production
- Session management via cookies

## Testing Strategy

### Unit Tests
```typescript
describe('AcssParser', () => {
  it('should parse valid ACSS dump', () => {
    const dump = { /* valid ACSS */ };
    const result = parseAcssDump(dump);
    expect(result.variables).toHaveLength(5);
  });

  it('should handle malformed dumps gracefully', () => {
    const dump = { /* malformed */ };
    expect(() => parseAcssDump(dump)).toThrow(AgentError);
  });
});
```

### Integration Tests
- Test agent workflows end-to-end
- Mock external API calls
- Verify database transactions
- Check scenario learning loops

### E2E Tests
- Critical user flows (create lesson, run build)
- Authentication flows
- Deployment validation

## Performance Optimization

### Caching Strategy
```typescript
// Cache parsed ACSS dumps
const acssCache = new Map<string, ParsedAcss>();

// Cache agent responses
const agentCache = new Map<string, AgentOutput>();

// Invalidate on scenario updates
function invalidateCache(scenarioId: string) {
  // Clear relevant caches
}
```

### Database Optimization
- Index frequently queried fields
- Paginate large result sets
- Use React Server Components for data fetching
- Lazy load agent modules

## Plugin Integration Patterns

### Reference Plugins
Study these official plugins for patterns:

1. **playground** - Interactive testing and modeling
2. **feature-dev** - Feature development workflow
3. **frontend-design** - UI/UX design patterns
4. **changelog-generator** - Auto-documentation (IMPLEMENT THIS FIRST)
5. **codebase-documenter** - Code documentation
6. **context7-docs-fetcher** - External docs integration
7. **deployment-engineer** - Deployment automation
8. **frontend-developer** - Frontend best practices
9. **ui-designer** - UI component patterns
10. **ux-researcher** - User experience analysis

### Pattern Extraction
When referencing plugins:
- Extract core patterns, not specific implementations
- Adapt to Bricks/ACSS context
- Maintain simplicity and focus
- Document pattern sources

## Implementation Priorities

### Critical Path (MVP)
1. ✅ Changelog generation system
2. ✅ Agent base class
3. ✅ Bricks pattern analyzer
4. ✅ Enhanced structure agent
5. ✅ CSS agent
6. ✅ Agent orchestrator
7. ✅ Scenario management UI
8. ✅ Training data builder
9. ✅ Pattern learning engine

### Should Have
- Review agent for quality control
- Reference agent for documentation
- Agent management dashboard
- Visual comparison system

### Nice to Have
- Content asset library
- Advanced visual diff
- Multi-version agent support
- Real-time collaboration

## Documentation Requirements

### Code Documentation
```typescript
/**
 * Parse ACSS JavaScript dump and extract CSS variables
 *
 * @param dump - Raw ACSS dump object from page inspector
 * @returns Parsed structure with variables, breakpoints, and settings
 * @throws {AgentError} When dump format is invalid or unsupported
 *
 * @example
 * ```typescript
 * const parsed = parseAcssDump(acssDump);
 * console.log(parsed.variables.length); // 42
 * ```
 */
function parseAcssDump(dump: Record<string, unknown>): ParsedAcss {
  // Implementation
}
```

### API Documentation
Every API route MUST have:
- Request/response schemas (Zod)
- Example requests
- Error codes and meanings
- Authentication requirements
- Rate limiting details

### Architecture Documentation
Maintain these docs:
- `docs/ARCHITECTURE.md` - System design
- `docs/AGENT_DEVELOPMENT.md` - Agent creation guide
- `docs/API.md` - Complete API reference
- `docs/USER_GUIDE.md` - End-user documentation
- `docs/CONTRIBUTING.md` - Contribution guidelines

## Common Pitfalls to Avoid

❌ **Don't**: Commit without changelog entry
✅ **Do**: Auto-generate changelog for every commit

❌ **Don't**: Create large PRs (>200 lines)
✅ **Do**: Break work into small, focused chunks

❌ **Don't**: Skip bot review feedback
✅ **Do**: Address all bot concerns before proceeding

❌ **Don't**: Hardcode credentials or secrets
✅ **Do**: Use environment variables with placeholders

❌ **Don't**: Mutate agent state between executions
✅ **Do**: Keep agents stateless and pure

❌ **Don't**: Generate untested Bricks structures
✅ **Do**: Validate all outputs with BricksValidator

❌ **Don't**: Implement features without scenarios
✅ **Do**: Create teaching scenarios for all patterns

## Success Metrics

### MVP Launch Criteria
- [ ] Changelog auto-generated for all changes
- [ ] Agents learn from approved scenarios
- [ ] Structure agent generates valid Bricks JSON
- [ ] CSS agent applies proper ACSS styling
- [ ] All APIs documented
- [ ] Core user flows tested
- [ ] Deployment successful

### Quality Targets
- Agent confidence score > 0.7 for simple layouts
- Generated structures pass BricksValidator
- Response time < 5 seconds for structure generation
- 100% of changes have changelog entries
- Zero security vulnerabilities
- All core APIs documented

## Getting Help

- **Documentation**: `/docs` directory
- **Examples**: Study existing agents in `/src/lib/agents`
- **Patterns**: Reference official Claude Code plugins
- **Issues**: https://github.com/Aventerica89/bricks-cc/issues

---

**Remember**: Small chunks, auto-changelog, wait for bot reviews, maintain quality.
