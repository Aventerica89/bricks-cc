/**
 * Structure Agent — AI-Powered Version
 *
 * Calls Claude CLI to generate Bricks element structures.
 * Falls back to basic template generation if CLI is unavailable.
 */

import { execFileSync } from "child_process";
import { nanoid } from "nanoid";
import { CONFIDENCE_SCORING } from "./constants";
import {
  buildStructurePrompt,
  extractJsonFromResponse,
} from "./prompts/structure-prompt";

export type StructureAgentInput = {
  acssJsDump?: Record<string, unknown>;
  containerGridCode?: string;
  description?: string;
  referenceScenarios?: Array<{
    name: string;
    expectedOutput: Record<string, unknown>;
  }>;
};

export type StructureAgentOutput = {
  success: boolean;
  confidence: number;
  structure: Record<string, unknown>;
  reasoning: string[];
  warnings: string[];
  metadata: {
    elementsGenerated: number;
    usedReferenceScenarios: string[];
    executionTime: number;
    aiGenerated: boolean;
  };
};

export class StructureAgent {
  async analyze(input: StructureAgentInput): Promise<StructureAgentOutput> {
    const startTime = Date.now();
    const reasoning: string[] = [];
    const warnings: string[] = [];

    // Try AI generation first
    if (process.env.CLAUDE_CLI_ENABLED === "true") {
      reasoning.push("Claude CLI enabled, attempting AI generation");

      try {
        const result = await this.generateWithClaude(
          input,
          reasoning,
          warnings
        );
        const executionTime = Date.now() - startTime;

        return {
          success: true,
          confidence: this.calculateConfidence(input, true),
          structure: result,
          reasoning,
          warnings,
          metadata: {
            elementsGenerated: this.countElements(result),
            usedReferenceScenarios:
              input.referenceScenarios?.map((s) => s.name) ?? [],
            executionTime,
            aiGenerated: true,
          },
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        warnings.push(`AI generation failed: ${errorMsg}`);
        reasoning.push("Falling back to template generation");
      }
    } else {
      reasoning.push(
        "Claude CLI not enabled, using template generation"
      );
      warnings.push(
        "Set CLAUDE_CLI_ENABLED=true for AI-powered generation"
      );
    }

    // Fallback to basic template
    const structure = this.generateBasicStructure(input);
    reasoning.push("Generated basic container structure (template)");

    if (
      input.referenceScenarios &&
      input.referenceScenarios.length > 0
    ) {
      reasoning.push(
        `${input.referenceScenarios.length} reference scenarios available but not used in template mode`
      );
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      confidence: this.calculateConfidence(input, false),
      structure,
      reasoning,
      warnings,
      metadata: {
        elementsGenerated: this.countElements(structure),
        usedReferenceScenarios:
          input.referenceScenarios?.map((s) => s.name) ?? [],
        executionTime,
        aiGenerated: false,
      },
    };
  }

  private async generateWithClaude(
    input: StructureAgentInput,
    reasoning: string[],
    warnings: string[]
  ): Promise<Record<string, unknown>> {
    const { systemPrompt, userPrompt } = buildStructurePrompt(input);

    if (
      input.referenceScenarios &&
      input.referenceScenarios.length > 0
    ) {
      reasoning.push(
        `Using ${input.referenceScenarios.length} reference scenarios as few-shot examples`
      );
    }

    if (input.acssJsDump) {
      reasoning.push("ACSS JS dump provided, included in prompt");
    }

    if (input.containerGridCode) {
      reasoning.push("Container grid code provided, included in prompt");
    }

    // Build the full prompt for the CLI
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

    // Call Claude CLI using execFileSync (no shell injection risk)
    const response = execFileSync(
      "claude",
      ["--output-format", "json", "-p", fullPrompt],
      {
        encoding: "utf-8",
        timeout: 60000,
        env: { ...process.env },
        maxBuffer: 1024 * 1024,
      }
    );

    reasoning.push("Claude CLI returned response");

    // Parse the CLI JSON envelope
    let claudeText: string;
    try {
      const cliResponse = JSON.parse(response);
      claudeText =
        cliResponse.result ||
        cliResponse.content ||
        cliResponse.text ||
        response;
    } catch {
      // If CLI response isn't JSON envelope, use raw
      claudeText = response;
    }

    // Extract the Bricks JSON from Claude's response
    const structure = extractJsonFromResponse(claudeText);

    if (!structure) {
      throw new Error("Could not parse Bricks JSON from AI response");
    }

    // Basic validation — must have id, name, settings
    if (!structure.id || !structure.name || !structure.settings) {
      warnings.push("AI output missing some standard fields");
      if (!structure.id) structure.id = `ai_${nanoid(12)}`;
      if (!structure.name) structure.name = "container";
      if (!structure.settings) structure.settings = {};
    }

    reasoning.push("AI-generated structure validated");
    return structure;
  }

  private calculateConfidence(
    input: StructureAgentInput,
    aiGenerated: boolean
  ): number {
    let confidence = aiGenerated
      ? CONFIDENCE_SCORING.BASE_CONFIDENCE + 0.1
      : CONFIDENCE_SCORING.BASE_CONFIDENCE;

    if (input.acssJsDump) {
      confidence += CONFIDENCE_SCORING.ACSS_JS_DUMP_BOOST;
    }
    if (input.containerGridCode) {
      confidence += CONFIDENCE_SCORING.CONTAINER_GRID_BOOST;
    }
    if (
      input.referenceScenarios &&
      input.referenceScenarios.length > 0
    ) {
      confidence += CONFIDENCE_SCORING.REFERENCE_SCENARIOS_BOOST;
    }

    return Math.min(confidence, CONFIDENCE_SCORING.MAX_CONFIDENCE);
  }

  private generateBasicStructure(
    input: StructureAgentInput
  ): Record<string, unknown> {
    return {
      id: `container_${nanoid(12)}`,
      name: "container",
      label: "Container",
      settings: {
        _cssClasses: ["container"],
        tag: "div",
      },
      children: [
        {
          id: `section_${nanoid(12)}`,
          name: "section",
          label: "Section",
          settings: {
            _cssClasses: ["section"],
            tag: "section",
          },
          children: input.description
            ? [
                {
                  id: `heading_${nanoid(12)}`,
                  name: "heading",
                  label: "Heading",
                  settings: {
                    text: input.description,
                    tag: "h2",
                  },
                },
              ]
            : [],
        },
      ],
    };
  }

  private countElements(structure: Record<string, unknown>): number {
    let count = 1;
    const children = structure.children as
      | Array<Record<string, unknown>>
      | undefined;

    if (children && Array.isArray(children)) {
      for (const child of children) {
        count += this.countElements(child);
      }
    }

    return count;
  }
}

export const structureAgent = new StructureAgent();
