import Anthropic from "@anthropic-ai/sdk";
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
 * Process a message using the Anthropic API directly
 */
export async function processWithClaude(
  input: ClaudeCliInput
): Promise<ClaudeCliOutput> {
  const startTime = Date.now();

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      response:
        "Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your environment.",
      executionTime: Date.now() - startTime,
    };
  }

  const userContent = `Context:\n${input.context}\n\nUser: ${input.userMessage}`;

  console.log("[Claude] Context length:", input.context.length, "chars");
  console.log("[Claude] Context preview:", input.context.substring(0, 500));

  try {
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: input.systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const executionTime = Date.now() - startTime;

    const textBlock = message.content.find((b) => b.type === "text");
    const response = textBlock && textBlock.type === "text"
      ? textBlock.text
      : "No response generated.";

    return {
      response,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("Anthropic API error:", error);

    return {
      response:
        "I apologize, but I encountered an error processing your request. Please try again.",
      executionTime,
    };
  }
}

/**
 * Build context string from chat context
 */
export function buildContextString(context: ChatContext): string {
  const parts: string[] = [];

  parts.push(`Client ID: ${context.clientId}`);
  parts.push(`Site ID: ${context.siteId}`);

  if (context.basecampProjects && context.basecampProjects.length > 0) {
    parts.push(`\nBasecamp Projects (${context.basecampProjects.length} total):`);
    context.basecampProjects.forEach((p) => {
      parts.push(`  - [${p.id}] ${p.name}${p.description ? `: ${p.description}` : ""}`);
    });
  }

  if (context.basecampDetails && context.basecampDetails.length > 0) {
    context.basecampDetails.forEach((detail) => {
      parts.push(`\n--- ${detail.projectName} (ID: ${detail.projectId}) ---`);
      if (detail.todos.length > 0) {
        parts.push("Active Todos:");
        detail.todos.forEach((todo) => {
          const status = todo.completed ? "[DONE]" : "[TODO]";
          const due = todo.dueDate ? ` (due: ${todo.dueDate})` : "";
          const who = todo.assignee ? ` [${todo.assignee}]` : "";
          parts.push(`  ${status} ${todo.content}${due}${who}`);
        });
      } else {
        parts.push("No active todos.");
      }
      if (detail.recentMessages.length > 0) {
        parts.push("Recent Messages:");
        detail.recentMessages.forEach((msg) => {
          parts.push(`  - ${msg.subject} (${msg.createdAt})`);
        });
      }
    });
  }

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
