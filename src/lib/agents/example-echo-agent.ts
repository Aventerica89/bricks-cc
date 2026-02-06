/**
 * Example Echo Agent
 *
 * Demonstrates how to extend BaseAgent to create a custom agent.
 * This agent simply echoes back the input with some processing.
 */

import { z } from "zod";
import { BaseAgent, AgentContext, AgentError, AgentConfig } from "./base-agent";

/**
 * Input schema for Echo Agent
 */
const echoInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  repeat: z.number().int().positive().max(10).default(1),
  transform: z.enum(["uppercase", "lowercase", "reverse", "none"]).default("none"),
});

/**
 * Echo Agent Input type
 */
export type EchoInput = z.infer<typeof echoInputSchema>;

/**
 * Echo Agent Output type
 */
export interface EchoOutput {
  originalMessage: string;
  processedMessage: string;
  transformApplied: string;
  repeatCount: number;
  messageLength: number;
}

/**
 * Example Echo Agent
 *
 * Demonstrates:
 * - Input validation with Zod
 * - Context usage for reasoning/warnings
 * - Confidence calculation based on processing
 * - Error handling
 *
 * @example
 * ```typescript
 * const agent = new EchoAgent({ id: "echo-1" });
 * const result = await agent.run({
 *   message: "Hello World",
 *   repeat: 2,
 *   transform: "uppercase"
 * });
 * console.log(result.data.processedMessage); // "HELLO WORLD HELLO WORLD"
 * ```
 */
export class EchoAgent extends BaseAgent<EchoInput, EchoOutput> {
  constructor(config: Partial<AgentConfig> = {}) {
    super({
      type: "EchoAgent",
      minConfidence: 0.7,
      ...config,
    });
  }

  /**
   * Validate input using Zod schema
   */
  protected validateInput(input: EchoInput): void {
    try {
      echoInputSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AgentError(
          "VALIDATION_ERROR",
          "Input validation failed",
          { issues: error.issues },
          true
        );
      }
      throw error;
    }
  }

  /**
   * Execute the echo agent logic
   */
  protected async execute(
    input: EchoInput,
    context: AgentContext
  ): Promise<EchoOutput> {
    context.reasoning.push("Starting echo agent execution");

    // Validate and normalize input
    const validated = echoInputSchema.parse(input);
    const { message, repeat, transform } = validated;

    context.reasoning.push(`Input message: "${message}"`);
    context.reasoning.push(`Transform: ${transform}, Repeat: ${repeat}`);

    // Apply transformation
    let processedMessage = message;

    switch (transform) {
      case "uppercase":
        processedMessage = message.toUpperCase();
        context.reasoning.push("Applied uppercase transformation");
        break;
      case "lowercase":
        processedMessage = message.toLowerCase();
        context.reasoning.push("Applied lowercase transformation");
        break;
      case "reverse":
        processedMessage = message.split("").reverse().join("");
        context.reasoning.push("Applied reverse transformation");
        break;
      case "none":
        context.reasoning.push("No transformation applied");
        break;
    }

    // Apply repetition
    if (repeat > 1) {
      processedMessage = Array(repeat).fill(processedMessage).join(" ");
      context.reasoning.push(`Repeated message ${repeat} times`);
    }

    // Add warnings for edge cases
    if (message.length > 1000) {
      context.warnings.push("Input message is very long (>1000 chars)");
    }

    if (repeat > 5) {
      context.warnings.push("High repeat count may impact performance");
    }

    // Store metadata
    context.metadata.characterCount = message.length;
    context.metadata.wordCount = message.split(/\s+/).length;

    context.reasoning.push("Echo agent execution completed");

    return {
      originalMessage: message,
      processedMessage,
      transformApplied: transform,
      repeatCount: repeat,
      messageLength: processedMessage.length,
    };
  }

  /**
   * Calculate confidence based on processing
   *
   * Confidence is higher when:
   * - Message is within optimal length (10-500 chars)
   * - Repeat count is reasonable (1-3)
   * - No warnings were generated
   */
  protected calculateConfidence(
    output: EchoOutput,
    context: AgentContext
  ): number {
    let confidence = 1.0;

    // Penalize very short messages
    if (output.originalMessage.length < 10) {
      confidence -= 0.1;
    }

    // Penalize very long messages
    if (output.originalMessage.length > 500) {
      confidence -= 0.2;
    }

    // Penalize high repeat counts
    if (output.repeatCount > 5) {
      confidence -= 0.15;
    }

    // Penalize if warnings were generated
    confidence -= context.warnings.length * 0.1;

    return Math.max(0, Math.min(1, confidence));
  }
}
