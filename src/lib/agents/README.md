# Agents

This directory contains AI agents for the Bricks Builder teaching system.

## Base Agent Pattern

All agents extend `BaseAgent<TInput, TOutput>` which provides:

- **Standardized execution flow** (`run()` method)
- **Input validation** with Zod schemas
- **Confidence calculation** (0-1 scale)
- **Execution context** for reasoning, warnings, and metadata
- **Error handling** with `AgentError` class
- **Timeout protection** (configurable, default 30s)
- **Logging and telemetry**

## Creating a New Agent

### 1. Define Input/Output Types

```typescript
import { z } from "zod";

const myInputSchema = z.object({
  field: z.string(),
});

export type MyInput = z.infer<typeof myInputSchema>;

export interface MyOutput {
  result: string;
}
```

### 2. Extend BaseAgent

```typescript
import { BaseAgent, AgentContext, AgentError } from "./base-agent";

export class MyAgent extends BaseAgent<MyInput, MyOutput> {
  constructor(config = {}) {
    super({
      type: "MyAgent",
      minConfidence: 0.7,
      ...config,
    });
  }

  protected validateInput(input: MyInput): void {
    myInputSchema.parse(input);
  }

  protected async execute(
    input: MyInput,
    context: AgentContext
  ): Promise<MyOutput> {
    context.reasoning.push("Starting execution");

    // Your agent logic here
    const result = input.field.toUpperCase();
    context.reasoning.push(`Processed field: ${input.field} -> ${result}`);

    context.reasoning.push("Execution complete");
    return { result };
  }

  protected calculateConfidence(
    output: MyOutput,
    context: AgentContext
  ): number {
    // Custom confidence calculation
    return 0.9;
  }
}
```

### 3. Use the Agent

```typescript
const agent = new MyAgent({ id: "my-agent-1" });
const result = await agent.run({ field: "value" });

console.log(result.success); // true/false
console.log(result.confidence); // 0-1
console.log(result.data); // MyOutput
console.log(result.reasoning); // string[]
console.log(result.warnings); // string[]
```

## Available Agents

### Production Agents

- **StructureAgent** - Generates Bricks element structures from ACSS dumps
- _More agents to be implemented..._

### Example Agents

- **EchoAgent** - Example agent demonstrating base class usage

## Agent Output Structure

All agents return a standardized `AgentOutput<T>`:

```typescript
{
  success: boolean;           // Execution succeeded
  confidence: number;         // 0-1 confidence score
  data: T;                    // Agent-specific output
  reasoning: string[];        // Step-by-step reasoning
  warnings: string[];         // Non-critical issues
  errors?: string[];          // Errors that occurred
  metadata: {
    agentType: string;        // Agent identifier
    executionTime: number;    // Execution time in ms
    timestamp: number;        // Unix timestamp
    // ... agent-specific metadata
  }
}
```

## Error Handling

Use `AgentError` for agent-specific errors:

```typescript
throw new AgentError(
  "INVALID_INPUT", // Error code
  "Input validation failed", // Message
  { details: "..." }, // Optional details
  true // Recoverable?
);
```

## Configuration Options

```typescript
{
  id: string;                 // Agent identifier
  type: string;               // Agent type/name
  maxExecutionTime: number;   // Timeout in ms (default: 30000)
  minConfidence: number;      // Min confidence threshold (default: 0.6)
  enableLogging: boolean;     // Enable console logging (default: true)
}
```

## Testing

Run tests with:

```bash
npx tsx tests/echo-agent.test.ts
```

## Best Practices

1. **Always validate input** with Zod schemas
2. **Add reasoning steps** throughout execution for transparency
3. **Include warnings** for non-critical issues
4. **Calculate confidence** based on multiple factors
5. **Handle errors gracefully** with `AgentError`
6. **Keep agents focused** - one responsibility per agent
7. **Document expected inputs/outputs** with TypeScript types
8. **Test edge cases** thoroughly

## Next Steps

- Implement CSS Agent
- Implement Review Agent
- Implement Reference Agent
- Add agent orchestration layer
- Integrate with teaching system
