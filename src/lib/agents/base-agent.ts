/**
 * Base Agent Class
 *
 * Abstract base class for all AI agents in the Bricks Builder teaching system.
 * Provides standardized patterns for execution, confidence calculation, logging,
 * and error handling.
 */

import { z } from "zod";

/**
 * Standard agent execution result
 *
 * When success is true, data will contain the agent output.
 * When success is false, data will be undefined and errors will contain details.
 */
export interface AgentOutput<T = unknown> {
  success: boolean;
  confidence: number; // 0-1 scale
  data?: T;
  reasoning: string[];
  warnings: string[];
  errors?: string[];
  metadata: {
    agentType: string;
    executionTime: number;
    timestamp: number;
    [key: string]: unknown;
  };
}

/**
 * Agent configuration options
 */
export interface AgentConfig {
  /**
   * Agent identifier
   */
  id: string;

  /**
   * Agent type/name
   */
  type: string;

  /**
   * Maximum execution time in milliseconds
   */
  maxExecutionTime?: number;

  /**
   * Minimum confidence threshold for success
   */
  minConfidence?: number;

  /**
   * Enable detailed logging
   */
  enableLogging?: boolean;

  /**
   * Additional agent-specific configuration
   */
  [key: string]: unknown;
}

/**
 * Agent execution context
 */
export interface AgentContext {
  /**
   * Execution start time
   */
  startTime: number;

  /**
   * Reasoning steps accumulated during execution
   */
  reasoning: string[];

  /**
   * Warnings accumulated during execution
   */
  warnings: string[];

  /**
   * Errors accumulated during execution
   */
  errors: string[];

  /**
   * Custom metadata
   */
  metadata: Record<string, unknown>;
}

/**
 * Custom agent error class
 */
export class AgentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = "AgentError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Abstract base agent class
 *
 * All agents should extend this class and implement the execute method.
 *
 * @example
 * ```typescript
 * class MyAgent extends BaseAgent<MyInput, MyOutput> {
 *   async execute(input: MyInput, context: AgentContext): Promise<MyOutput> {
 *     context.reasoning.push("Starting execution");
 *     // ... agent logic
 *     return { result: "done" };
 *   }
 *
 *   protected calculateConfidence(output: MyOutput, context: AgentContext): number {
 *     return 0.8;
 *   }
 * }
 * ```
 */
export abstract class BaseAgent<TInput = unknown, TOutput = unknown> {
  protected config: AgentConfig;

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      id: config.id || `agent_${Date.now()}`,
      type: config.type || this.constructor.name,
      maxExecutionTime: config.maxExecutionTime || 30000,
      minConfidence: config.minConfidence || 0.6,
      enableLogging: config.enableLogging ?? true,
      ...config,
    };
  }

  /**
   * Main execution method - must be implemented by subclasses
   *
   * @param input - Agent-specific input data
   * @param context - Execution context for tracking reasoning and metadata
   * @returns Agent-specific output data
   */
  protected abstract execute(
    input: TInput,
    context: AgentContext
  ): Promise<TOutput>;

  /**
   * Calculate confidence score for the output
   *
   * Override this method to implement custom confidence calculation.
   *
   * @param output - Agent output data
   * @param context - Execution context
   * @returns Confidence score between 0 and 1
   */
  protected abstract calculateConfidence(
    output: TOutput,
    context: AgentContext
  ): number;

  /**
   * Validate input data before execution
   *
   * Override this method to implement custom input validation.
   * Default implementation does no validation.
   *
   * @param input - Input data to validate
   * @throws {AgentError} When validation fails
   */
  protected validateInput(input: TInput): void {
    // Default: no validation
    // Subclasses should override with Zod schemas or custom validation
  }

  /**
   * Run the agent with full execution pipeline
   *
   * This method orchestrates the full execution flow:
   * 1. Input validation
   * 2. Context initialization
   * 3. Execute agent logic
   * 4. Calculate confidence
   * 5. Build standardized output
   * 6. Log execution
   *
   * @param input - Agent-specific input data
   * @returns Standardized agent output
   */
  async run(input: TInput): Promise<AgentOutput<TOutput>> {
    const startTime = Date.now();

    // Initialize execution context
    const context: AgentContext = {
      startTime,
      reasoning: [],
      warnings: [],
      errors: [],
      metadata: {},
    };

    try {
      // Validate input
      this.validateInput(input);
      context.reasoning.push("Input validation passed");

      // Check execution timeout
      const timeout = this.config.maxExecutionTime!;
      let timeoutId: NodeJS.Timeout | undefined;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () =>
            reject(
              new AgentError(
                "EXECUTION_TIMEOUT",
                `Agent execution exceeded ${timeout}ms`,
                { timeout },
                false
              )
            ),
          timeout
        );
      });

      // Execute agent with timeout
      const data = await Promise.race([
        this.execute(input, context),
        timeoutPromise,
      ]);

      // Clear timeout if execution completed before timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Calculate confidence
      const confidence = this.calculateConfidence(data, context);

      // Check minimum confidence threshold
      if (confidence < this.config.minConfidence!) {
        context.warnings.push(
          `Confidence ${confidence.toFixed(2)} below minimum threshold ${this.config.minConfidence}`
        );
      }

      // Build output
      const executionTime = Date.now() - startTime;
      const output: AgentOutput<TOutput> = {
        success: true,
        confidence: Math.max(0, Math.min(1, confidence)),
        data,
        reasoning: context.reasoning,
        warnings: context.warnings,
        errors: context.errors.length > 0 ? context.errors : undefined,
        metadata: {
          agentType: this.config.type,
          executionTime,
          timestamp: Date.now(),
          ...context.metadata,
        },
      };

      // Log execution
      this.logExecution(output);

      return output;
    } catch (error) {
      // Handle execution errors
      const executionTime = Date.now() - startTime;

      if (error instanceof AgentError) {
        context.errors.push(`[${error.code}] ${error.message}`);

        if (this.config.enableLogging) {
          console.error(`Agent ${this.config.type} error:`, {
            code: error.code,
            message: error.message,
            details: error.details,
            recoverable: error.recoverable,
          });
        }

        return {
          success: false,
          confidence: 0,
          reasoning: context.reasoning,
          warnings: context.warnings,
          errors: context.errors,
          metadata: {
            agentType: this.config.type,
            executionTime,
            timestamp: Date.now(),
            errorCode: error.code,
            recoverable: error.recoverable,
            ...context.metadata,
          },
        };
      }

      // Unknown error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      context.errors.push(errorMessage);

      if (this.config.enableLogging) {
        console.error(`Agent ${this.config.type} unexpected error:`, error);
      }

      return {
        success: false,
        confidence: 0,
        reasoning: context.reasoning,
        warnings: context.warnings,
        errors: context.errors,
        metadata: {
          agentType: this.config.type,
          executionTime,
          timestamp: Date.now(),
          errorCode: "UNKNOWN_ERROR",
          recoverable: false,
          ...context.metadata,
        },
      };
    }
  }

  /**
   * Log agent execution for telemetry and debugging
   *
   * Override this method to customize logging behavior.
   *
   * @param output - Agent execution output
   */
  protected logExecution(output: AgentOutput<TOutput>): void {
    if (!this.config.enableLogging) {
      return;
    }

    console.log(`[${this.config.type}] Execution completed:`, {
      success: output.success,
      confidence: output.confidence.toFixed(2),
      executionTime: `${output.metadata.executionTime}ms`,
      warnings: output.warnings.length,
      errors: output.errors?.length || 0,
    });
  }

  /**
   * Get agent configuration
   */
  getConfig(): Readonly<AgentConfig> {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   */
  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
