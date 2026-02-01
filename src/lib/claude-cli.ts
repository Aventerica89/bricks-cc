import { execSync, spawn } from "child_process";
import path from "path";
import type { ChatContext, ChatAction } from "@/types/chat";

export interface ClaudeCliInput {
  userMessage: string;
  context: string;
  systemPrompt: string;
  siteId: string;
}

export interface ClaudeCliOutput {
  response: string;
  actions?: ChatAction[];
  tokensUsed?: number;
  executionTime: number;
}

/**
 * Process a message using Claude Code CLI
 */
export async function processWithClaude(
  input: ClaudeCliInput
): Promise<ClaudeCliOutput> {
  const startTime = Date.now();

  if (!process.env.CLAUDE_CLI_ENABLED) {
    return {
      response:
        "Claude CLI is not enabled. Please set CLAUDE_CLI_ENABLED=true in your environment.",
      executionTime: Date.now() - startTime,
    };
  }

  const scriptPath = path.join(
    process.cwd(),
    "claude-scripts",
    "process-chat.sh"
  );

  // Build the prompt
  const fullPrompt = `${input.systemPrompt}

Context:
${input.context}

User: ${input.userMessage}`;

  try {
    // Execute the Claude CLI script
    const response = execSync(
      `echo "${escapeShellArg(fullPrompt)}" | bash "${scriptPath}"`,
      {
        encoding: "utf-8",
        timeout: 60000, // 60 second timeout
        env: {
          ...process.env,
          CLAUDE_MODE: "cli",
          SITE_ID: input.siteId,
        },
      }
    );

    const executionTime = Date.now() - startTime;

    // Try to parse as JSON (for structured responses)
    try {
      const parsed = JSON.parse(response);
      return {
        response: parsed.response || response.trim(),
        actions: parsed.actions,
        tokensUsed: parsed.tokens_used,
        executionTime,
      };
    } catch {
      // Plain text response
      return {
        response: response.trim(),
        executionTime,
      };
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Claude CLI error:", error);

    return {
      response:
        "I apologize, but I encountered an error processing your request. Please try again.",
      executionTime,
    };
  }
}

/**
 * Stream response from Claude CLI
 */
export async function streamFromClaude(
  input: ClaudeCliInput,
  onChunk: (chunk: string) => void
): Promise<ClaudeCliOutput> {
  const startTime = Date.now();

  const scriptPath = path.join(
    process.cwd(),
    "claude-scripts",
    "process-chat.sh"
  );

  const fullPrompt = `${input.systemPrompt}

Context:
${input.context}

User: ${input.userMessage}`;

  return new Promise((resolve, reject) => {
    const child = spawn("bash", [scriptPath], {
      env: {
        ...process.env,
        CLAUDE_MODE: "cli",
        SITE_ID: input.siteId,
      },
    });

    let fullResponse = "";

    child.stdout.on("data", (data: Buffer) => {
      const chunk = data.toString();
      fullResponse += chunk;
      onChunk(chunk);
    });

    child.stderr.on("data", (data: Buffer) => {
      console.error("Claude CLI stderr:", data.toString());
    });

    child.on("close", (code) => {
      const executionTime = Date.now() - startTime;

      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}`));
        return;
      }

      resolve({
        response: fullResponse.trim(),
        executionTime,
      });
    });

    // Send the prompt to stdin
    child.stdin.write(fullPrompt);
    child.stdin.end();
  });
}

/**
 * Build context string from chat context
 */
export function buildContextString(context: ChatContext): string {
  const parts: string[] = [];

  parts.push(`Client ID: ${context.clientId}`);
  parts.push(`Site ID: ${context.siteId}`);

  if (context.basecampData) {
    parts.push(`\nBasecamp Project: ${context.basecampData.projectName}`);

    if (context.basecampData.todos.length > 0) {
      parts.push("\nActive Todos:");
      context.basecampData.todos.forEach((todo) => {
        const status = todo.completed ? "[DONE]" : "[TODO]";
        parts.push(`  ${status} ${todo.content}`);
        if (todo.dueDate) {
          parts.push(`    Due: ${todo.dueDate}`);
        }
      });
    }

    if (context.basecampData.milestones.length > 0) {
      parts.push("\nMilestones:");
      context.basecampData.milestones.forEach((ms) => {
        const status = ms.completed ? "[COMPLETE]" : "[UPCOMING]";
        parts.push(`  ${status} ${ms.title}`);
        if (ms.dueDate) {
          parts.push(`    Due: ${ms.dueDate}`);
        }
      });
    }
  }

  if (context.bricksData) {
    parts.push(`\nCurrent Page: ${context.bricksData.pageTitle}`);
    parts.push(`Page ID: ${context.bricksData.pageId}`);
    parts.push(`Elements on page: ${context.bricksData.elements.length}`);

    // Include simplified element structure
    if (context.bricksData.elements.length > 0) {
      parts.push("\nPage Elements:");
      context.bricksData.elements.slice(0, 10).forEach((el) => {
        parts.push(`  - ${el.type} (id: ${el.id})`);
      });
      if (context.bricksData.elements.length > 10) {
        parts.push(
          `  ... and ${context.bricksData.elements.length - 10} more elements`
        );
      }
    }
  }

  if (context.recentMessages && context.recentMessages.length > 0) {
    parts.push("\nRecent conversation:");
    context.recentMessages.slice(-5).forEach((msg) => {
      const role = msg.role === "user" ? "Client" : "Assistant";
      parts.push(`  ${role}: ${msg.content.substring(0, 100)}...`);
    });
  }

  return parts.join("\n");
}

/**
 * Escape string for safe shell usage
 */
function escapeShellArg(arg: string): string {
  return arg
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$")
    .replace(/`/g, "\\`");
}
