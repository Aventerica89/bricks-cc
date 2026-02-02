import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { nanoid } from "nanoid";
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
 * Sanitize user input to prevent XSS using DOMPurify
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize HTML content (for rich text)
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a", "code", "pre"],
    ALLOWED_ATTR: ["href", "title"],
  });
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

// ========================================
// Teaching System Validators
// ========================================

/**
 * Lesson validation schemas
 */
export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  category: z.enum(["container-grids", "media-queries", "plugin-resources", "acss-docs"]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  orderIndex: z.number().int().default(0),
  createdBy: z.string().default("admin"),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(["container-grids", "media-queries", "plugin-resources", "acss-docs"]).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  orderIndex: z.number().int().optional(),
});

/**
 * Scenario validation schemas
 */
export const createScenarioSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  acssJsDump: z.record(z.string(), z.unknown()).optional().nullable(),
  screenshotBeforeUrl: z.string().url().optional().nullable(),
  screenshotAfterUrl: z.string().url().optional().nullable(),
  correctContainerGridCode: z.string().optional().nullable(),
  cssHandlingRules: z.record(z.string(), z.unknown()).optional().nullable(),
  validationRules: z.record(z.string(), z.unknown()).optional().nullable(),
  expectedOutput: z.record(z.string(), z.unknown()).optional().nullable(),
});

/**
 * Build session validation schemas
 */
export const createBuildSessionSchema = z.object({
  lessonId: z.string().optional().nullable(),
  scenarioId: z.string().optional().nullable(),
  inputData: z.object({
    description: z.string().optional(),
    acssJsDump: z.record(z.string(), z.unknown()).optional(),
    containerGridCode: z.string().optional(),
  }).default({}),
  createdBy: z.string().default("admin"),
});

// ========================================
// ID Generation Utilities (using nanoid)
// ========================================

export function generateLessonId(): string {
  return `lesson_${nanoid(16)}`;
}

export function generateScenarioId(): string {
  return `scenario_${nanoid(16)}`;
}

export function generateBuildSessionId(): string {
  return `session_${nanoid(16)}`;
}

export function generateAgentId(): string {
  return `agent_${nanoid(16)}`;
}

export function generateContentAssetId(): string {
  return `content_${nanoid(16)}`;
}

// ========================================
// Teaching System Type Exports
// ========================================

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type CreateBuildSessionInput = z.infer<typeof createBuildSessionSchema>;
