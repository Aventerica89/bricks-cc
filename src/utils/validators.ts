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
      basecampProjectId: z.number().optional(),
      currentPageId: z.number().optional(),
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
 * Basic HTML entity encoding for serverless environments
 * Used as fallback when DOMPurify is not available
 */
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize user input to prevent XSS
 * Uses basic HTML escaping (safe for serverless environments)
 */
export function sanitizeInput(input: string): string {
  // Strip all HTML tags and escape special characters
  return escapeHtml(input.replace(/<[^>]*>/g, ''));
}

/**
 * Sanitize HTML content (for rich text)
 * Uses basic HTML escaping (safe for serverless environments)
 */
export function sanitizeHtml(html: string): string {
  // For serverless, we escape everything to be safe
  // In a full environment, you could use DOMPurify
  return escapeHtml(html.replace(/<[^>]*>/g, ''));
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
