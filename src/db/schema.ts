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
  apiToken: text("api_token"), // Should be encrypted in production
});

// Client sites
export const clientSites = sqliteTable("client_sites", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  wordpressApiUrl: text("wordpress_api_url"),
  bricksApiKey: text("bricks_api_key"),
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

// Export types
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
