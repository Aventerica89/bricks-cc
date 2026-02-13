import { z } from "zod";
import type { ChatRequest } from "@/types/chat";
import type { BricksEditRequest } from "@/types/bricks";
import type { ClientFeedbackRequest } from "@/types/client";

/**
 * Zod schema for chat requests
 */
const ChatRequestSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  siteId: z.string().min(1, "siteId is required"),
  message: z.string().min(1, "message is required").max(10000, "message must be less than 10000 characters"),
  context: z
    .object({
      basecampProjectId: z.coerce.number().optional(),
      currentPageId: z.coerce.number().optional(),
    })
    .optional(),
});

/**
 * Zod schema for Bricks edit requests
 */
const BricksEditSchema = z.object({
  elementId: z.string().min(1, "elementId is required"),
  property: z.string().min(1, "property is required"),
  value: z.unknown(),
});

const BricksEditRequestSchema = z.object({
  siteId: z.string().min(1, "siteId is required"),
  pageId: z.number().int().positive("pageId must be a positive integer"),
  edits: z.array(BricksEditSchema).min(1, "edits array cannot be empty"),
});

/**
 * Zod schema for client feedback requests
 */
const ClientFeedbackRequestSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  siteId: z.string().min(1, "siteId is required"),
  message: z.string().min(1, "message is required"),
  feedbackType: z.enum(["bug", "feature", "general"]).default("general"),
  attachments: z.array(z.string().url()).optional(),
});

/**
 * Validate a chat request
 */
export function validateChatRequest(
  data: unknown
): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  try {
    const validated = ChatRequestSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { valid: false, error: "Invalid request body" };
  }
}

/**
 * Validate a Bricks edit request
 */
export function validateBricksEditRequest(
  data: unknown
): { valid: true; data: BricksEditRequest } | { valid: false; error: string } {
  try {
    const validated = BricksEditRequestSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { valid: false, error: "Invalid request body" };
  }
}

/**
 * Validate a client feedback request
 */
export function validateFeedbackRequest(
  data: unknown
):
  | { valid: true; data: ClientFeedbackRequest }
  | { valid: false; error: string } {
  try {
    const validated = ClientFeedbackRequestSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0]?.message || "Validation failed" };
    }
    return { valid: false, error: "Invalid request body" };
  }
}

/**
 * Sanitize user input to prevent XSS.
 * Strips HTML tags only — no entity encoding needed because React's JSX
 * already escapes text content, so encoding quotes/apostrophes causes
 * them to render literally as &#39; etc.
 */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize HTML content (strip tags for plain text output)
 */
export function sanitizeHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Decode HTML entities in strings stored before the encoding fix.
 * Handles &amp; &lt; &gt; &quot; &#39; &#x27;
 */
export function decodeHtmlEntities(str: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (match) => entities[match] || match);
}

/**
 * Validate email format using Zod
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
}

/**
 * Validate URL format using Zod
 */
export function isValidUrl(url: string): boolean {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url).success;
}

// Teaching System Validators moved to @/utils/teaching-validators
// Import from there for: createLessonSchema, updateLessonSchema, createScenarioSchema,
// createBuildSessionSchema, generateLessonId, generateScenarioId, etc.
