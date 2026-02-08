import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Chat history
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  siteId: text("site_id").notNull(),
  userMessage: text("user_message").notNull(),
  claudeResponse: text("claude_response"),
  metadata: text("metadata", { mode: "json" }).$type<{
    bricksContext?: Record<string, unknown>;
    basecampContext?: Record<string, unknown>;
    tokensUsed?: number;
    executionTime?: number;
  }>(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Client feedback
export const clientFeedback = sqliteTable("client_feedback", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  siteId: text("site_id").notNull(),
  feedbackType: text("feedback_type").$type<"bug" | "feature" | "general">(),
  message: text("message").notNull(),
  attachments: text("attachments", { mode: "json" }).$type<string[]>(),
  basecampTodoId: text("basecamp_todo_id"),
  status: text("status")
    .$type<"pending" | "synced" | "resolved">()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Bricks page cache
export const bricksPages = sqliteTable("bricks_pages", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  pageId: integer("page_id"),
  pageTitle: text("page_title"),
  structure: text("structure", { mode: "json" }).$type<Record<string, unknown>>(),
  lastFetch: integer("last_fetch", { mode: "timestamp" }),
  editableByClient: integer("editable_by_client", { mode: "boolean" }).default(
    false
  ),
});

// Basecamp sync metadata
export const basecampSync = sqliteTable("basecamp_sync", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  basecampAccountId: integer("basecamp_account_id").notNull(),
  basecampProjectId: integer("basecamp_project_id").notNull(),
  syncStatus: text("sync_status")
    .$type<"active" | "paused" | "error">()
    .default("active"),
  lastSync: integer("last_sync", { mode: "timestamp" }),
  apiToken: text("api_token"), // Encrypted at rest (AES-256-GCM)
});

// Client sites
export const clientSites = sqliteTable("client_sites", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  wordpressApiUrl: text("wordpress_api_url"),
  bricksApiKey: text("bricks_api_key"), // Encrypted at rest (AES-256-GCM)
  basecampProjectId: integer("basecamp_project_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Clients
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company"),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Teaching System - Lessons
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").$type<"container-grids" | "media-queries" | "plugin-resources" | "acss-docs">().notNull(),
  status: text("status").$type<"draft" | "published" | "archived">().default("draft"),
  orderIndex: integer("order_index").default(0),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Teaching System - Lesson Scenarios
export const lessonScenarios = sqliteTable("lesson_scenarios", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull(),
  name: text("name").notNull(),
  acssJsDump: text("acss_js_dump", { mode: "json" }).$type<Record<string, unknown>>(),
  screenshotBeforeUrl: text("screenshot_before_url"),
  screenshotAfterUrl: text("screenshot_after_url"),
  correctContainerGridCode: text("correct_container_grid_code"),
  cssHandlingRules: text("css_handling_rules", { mode: "json" }).$type<Record<string, unknown>>(),
  validationRules: text("validation_rules", { mode: "json" }).$type<Record<string, unknown>>(),
  expectedOutput: text("expected_output", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Teaching System - Agents
export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<"css" | "structure" | "review" | "reference">().notNull(),
  systemPrompt: text("system_prompt"),
  config: text("config", { mode: "json" }).$type<{
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }>(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  version: integer("version").default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Teaching System - Agent Instructions
export const agentInstructions = sqliteTable("agent_instructions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull(),
  instructionType: text("instruction_type").notNull(),
  content: text("content"),
  githubSyncPath: text("github_sync_path"),
  lastSynced: integer("last_synced", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Build System - Build Sessions
export const buildSessions = sqliteTable("build_sessions", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id"),
  scenarioId: text("scenario_id"),
  phase: text("phase").$type<"javascript" | "css" | "testing" | "output">().default("javascript"),
  status: text("status").$type<"in_progress" | "review" | "approved" | "rejected">().default("in_progress"),
  inputData: text("input_data", { mode: "json" }).$type<Record<string, unknown>>(),
  agentOutputs: text("agent_outputs", { mode: "json" }).$type<Record<string, unknown>>(),
  reviewNotes: text("review_notes", { mode: "json" }).$type<Array<{ note: string; timestamp: number }>>(),
  finalOutput: text("final_output", { mode: "json" }).$type<Record<string, unknown>>(),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Visual Analysis - Visual Comparisons
export const visualComparisons = sqliteTable("visual_comparisons", {
  id: text("id").primaryKey(),
  buildSessionId: text("build_session_id").notNull(),
  comparisonType: text("comparison_type").$type<"before-after" | "expected-actual">().notNull(),
  beforeScreenshotUrl: text("before_screenshot_url"),
  afterScreenshotUrl: text("after_screenshot_url"),
  differenceMapUrl: text("difference_map_url"),
  approvalStatus: text("approval_status").$type<"pending" | "approved" | "rejected">().default("pending"),
  annotations: text("annotations", { mode: "json" }).$type<Array<{ x: number; y: number; note: string }>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Content Library - Content Assets
export const contentAssets = sqliteTable("content_assets", {
  id: text("id").primaryKey(),
  type: text("type").$type<"acss-video" | "frames-block" | "documentation" | "screenshot">().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  sourceUrl: text("source_url"),
  filePath: text("file_path"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  searchableContent: text("searchable_content"),
  indexedAt: integer("indexed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// Platform-wide settings (singleton row, id = "default")
export const platformSettings = sqliteTable("platform_settings", {
  id: text("id").primaryKey(),
  basecampAccountId: text("basecamp_account_id"),
  basecampOauthToken: text("basecamp_oauth_token"),
  bricksApiKey: text("bricks_api_key"),
  bricksSiteUrl: text("bricks_site_url"),
  claudeEnabled: integer("claude_enabled", { mode: "boolean" }).default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

// Export types - Original
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type ClientFeedback = typeof clientFeedback.$inferSelect;
export type NewClientFeedback = typeof clientFeedback.$inferInsert;

export type BricksPage = typeof bricksPages.$inferSelect;
export type NewBricksPage = typeof bricksPages.$inferInsert;

export type BasecampSync = typeof basecampSync.$inferSelect;
export type NewBasecampSync = typeof basecampSync.$inferInsert;

export type ClientSite = typeof clientSites.$inferSelect;
export type NewClientSite = typeof clientSites.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

// Export types - Teaching System
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonScenario = typeof lessonScenarios.$inferSelect;
export type NewLessonScenario = typeof lessonScenarios.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type AgentInstruction = typeof agentInstructions.$inferSelect;
export type NewAgentInstruction = typeof agentInstructions.$inferInsert;

export type BuildSession = typeof buildSessions.$inferSelect;
export type NewBuildSession = typeof buildSessions.$inferInsert;

export type VisualComparison = typeof visualComparisons.$inferSelect;
export type NewVisualComparison = typeof visualComparisons.$inferInsert;

export type ContentAsset = typeof contentAssets.$inferSelect;
export type NewContentAsset = typeof contentAssets.$inferInsert;

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type NewPlatformSettings = typeof platformSettings.$inferInsert;
