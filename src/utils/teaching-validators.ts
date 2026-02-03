import { z } from "zod";
import { nanoid } from "nanoid";

// ========================================
// Teaching System Validators
// Separate file to avoid isomorphic-dompurify import issues in serverless
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
