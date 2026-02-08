/**
 * Structure Agent Prompt Templates
 *
 * Builds the system prompt and user prompt for the Claude CLI call
 * that generates Bricks Builder JSON structures.
 */

import type { StructureAgentInput } from "../structure-agent";

const SYSTEM_PROMPT = `You are a Bricks Builder expert. Your job is to generate valid Bricks element JSON structures.

## Bricks Element Format

Every Bricks element follows this structure:
{
  "id": "unique_string",
  "name": "element_type",
  "label": "Human Label",
  "settings": {
    "_cssClasses": ["class1", "class2"],
    "tag": "div",
    // element-specific settings
  },
  "children": []  // nested elements
}

## Common Element Types
- "container" — wrapper div, usually the root
- "section" — semantic section with tag "section"
- "block" — generic block-level element
- "heading" — h1-h6, uses "text" and "tag" in settings
- "text-basic" — paragraph/text content, uses "text" in settings
- "image" — image element, uses "url" and "alt" in settings
- "button" — button/link, uses "text" and "link" in settings
- "div" — generic div for layout
- "code" — code block

## ACSS (Automatic CSS) Integration
When an ACSS JS dump is provided, use the CSS variables and classes from it.
Common ACSS patterns:
- Space variables: --space-xs, --space-s, --space-m, --space-l, --space-xl
- Color variables: --primary, --secondary, --accent, --text, --bg
- Grid classes: .grid, .grid--2, .grid--3, .grid--4
- Container classes: .container, .container--narrow, .container--wide

## Rules
1. Always generate valid JSON — no trailing commas, no comments
2. Use meaningful IDs (e.g., "hero_container", "main_heading")
3. Apply ACSS classes when ACSS data is available
4. Match the described layout as closely as possible
5. Nest elements logically (container > section > content)

## Output Format
Return ONLY a JSON code block with the root element. No explanation, no markdown outside the code block.`;

/**
 * Format reference scenarios as few-shot examples
 */
function formatFewShotExamples(
  scenarios: NonNullable<StructureAgentInput["referenceScenarios"]>
): string {
  if (scenarios.length === 0) return "";

  const examples = scenarios
    .map(
      (s, i) =>
        `### Example ${i + 1}: ${s.name}\n\`\`\`json\n${JSON.stringify(s.expectedOutput, null, 2)}\n\`\`\``
    )
    .join("\n\n");

  return `\n\n## Reference Examples\nHere are similar layouts and their correct Bricks JSON output:\n\n${examples}`;
}

/**
 * Build the full user prompt for the structure agent
 */
export function buildStructurePrompt(input: StructureAgentInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const parts: string[] = [];

  parts.push(`Generate a Bricks Builder JSON structure for the following:`);

  if (input.description) {
    parts.push(`\nDescription: ${input.description}`);
  }

  if (input.acssJsDump) {
    const dumpStr = JSON.stringify(input.acssJsDump);
    // Truncate if very large to avoid CLI arg limits
    const truncated =
      dumpStr.length > 4000 ? dumpStr.slice(0, 4000) + "..." : dumpStr;
    parts.push(`\nACSS JS Dump:\n${truncated}`);
  }

  if (input.containerGridCode) {
    parts.push(`\nContainer Grid CSS:\n${input.containerGridCode}`);
  }

  // Add few-shot examples from reference scenarios
  let systemWithExamples = SYSTEM_PROMPT;
  if (input.referenceScenarios && input.referenceScenarios.length > 0) {
    systemWithExamples += formatFewShotExamples(input.referenceScenarios);
  }

  return {
    systemPrompt: systemWithExamples,
    userPrompt: parts.join("\n"),
  };
}

/**
 * Extract JSON from a Claude response that may contain markdown fences
 */
export function extractJsonFromResponse(
  response: string
): Record<string, unknown> | null {
  // Try direct JSON parse first
  try {
    return JSON.parse(response.trim());
  } catch {
    // Not raw JSON, try to extract from code fences
  }

  // Match ```json ... ``` or ``` ... ```
  const fenceMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // Invalid JSON inside fences
    }
  }

  // Last resort: find first { to last }
  const firstBrace = response.indexOf("{");
  const lastBrace = response.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(response.slice(firstBrace, lastBrace + 1));
    } catch {
      // Couldn't extract valid JSON
    }
  }

  return null;
}
