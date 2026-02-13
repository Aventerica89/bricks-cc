import { db } from "./db";
import { chatMessages, clientSites } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { createBasecampClientFromSettings } from "./basecamp";
import { createBricksClient } from "./bricks";
import type { ChatContext, ChatMessage as ChatMessageType } from "@/types/chat";

export interface ContextBuilderOptions {
  clientId: string;
  siteId: string;
  siteUrl?: string;
  basecampProjectId?: number;
  currentPageId?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

/**
 * Build context for Claude from various sources
 */
export async function buildContext(
  options: ContextBuilderOptions
): Promise<ChatContext> {
  const context: ChatContext = {
    clientId: options.clientId,
    siteId: options.siteId,
  };

  // Fetch recent chat history
  if (options.includeHistory !== false) {
    const recentMessages = await getChatHistory(
      options.clientId,
      options.siteId,
      options.historyLimit || 5
    );
    context.recentMessages = recentMessages;
  }

  // Auto-lookup basecampProjectId from site record if not provided
  if (!options.basecampProjectId) {
    const siteInfo = await getClientSiteInfo(options.clientId, options.siteId);
    if (siteInfo?.basecampProjectId) {
      options = { ...options, basecampProjectId: siteInfo.basecampProjectId };
    }
  }

  // Fetch Basecamp data with 8s timeout to avoid Vercel function timeout
  try {
    const basecampData = await Promise.race([
      fetchBasecampContext(options.basecampProjectId),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);

    if (basecampData) {
      context.basecampProjects = basecampData.projects;
      context.basecampDetails = basecampData.details;
    }
  } catch (error) {
    console.error("Error fetching Basecamp data:", error);
  }

  // Fetch Bricks page data if page ID is provided
  if (options.currentPageId && options.siteUrl) {
    try {
      const bricksClient = createBricksClient(options.siteUrl);
      const pageState = await bricksClient.getPageState(options.currentPageId);

      context.bricksData = {
        pageId: pageState.pageId,
        pageTitle: pageState.pageTitle,
        elements: pageState.elements.map((el) => ({
          id: el.id,
          type: el.name,
          settings: el.settings,
          children: el.children?.map((c) => ({
            id: c,
            type: "child",
            settings: {},
          })),
        })),
      };
    } catch (error) {
      console.error("Error fetching Bricks data:", error);
    }
  }

  return context;
}

/**
 * Fetch Basecamp context data with minimal API calls.
 * Gets project list (1 call) + summary for ONE project (4-5 calls).
 */
async function fetchBasecampContext(targetProjectId?: number) {
  const basecampClient = await createBasecampClientFromSettings();
  const allProjects = await basecampClient.getProjects();

  const projects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    purpose: p.purpose,
    url: p.app_url,
  }));

  // Only fetch detailed summary for ONE project to stay fast
  const projectToDetail = targetProjectId || allProjects[0]?.id;
  const details: NonNullable<import("@/types/chat").ChatContext["basecampDetails"]> = [];

  if (projectToDetail) {
    try {
      const summary = await basecampClient.getProjectSummary(projectToDetail);
      details.push({
        projectId: summary.project.id,
        projectName: summary.project.name,
        todos: summary.activeTodos.map((todo) => ({
          id: todo.id,
          content: todo.content,
          completed: todo.completed,
          dueDate: todo.due_on,
          assignee: todo.assignees?.[0]?.name,
        })),
        recentMessages: summary.recentMessages.map((msg) => ({
          id: msg.id,
          subject: msg.subject,
          createdAt: msg.created_at,
        })),
      });
    } catch (err) {
      console.error("Error fetching project summary:", err);
    }
  }

  return { projects, details };
}

/**
 * Get recent chat history for a client and site
 */
async function getChatHistory(
  clientId: string,
  siteId: string,
  limit: number
): Promise<ChatMessageType[]> {
  const messages = await db
    .select()
    .from(chatMessages)
    .where(
      and(eq(chatMessages.clientId, clientId), eq(chatMessages.siteId, siteId))
    )
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit * 2); // Get both user and assistant messages

  // Convert to ChatMessage format and reverse for chronological order
  return messages
    .map((msg) => [
      {
        id: `${msg.id}-user`,
        role: "user" as const,
        content: msg.userMessage,
        timestamp: msg.createdAt || new Date(),
      },
      ...(msg.claudeResponse
        ? [
            {
              id: `${msg.id}-assistant`,
              role: "assistant" as const,
              content: msg.claudeResponse,
              timestamp: msg.createdAt || new Date(),
            },
          ]
        : []),
    ])
    .flat()
    .reverse()
    .slice(-limit * 2);
}

/**
 * Get client site information from the database
 */
export async function getClientSiteInfo(
  clientId: string,
  siteId: string
): Promise<{
  siteUrl?: string;
  basecampProjectId?: number;
} | null> {
  const site = await db
    .select({
      url: clientSites.url,
      basecampProjectId: clientSites.basecampProjectId,
    })
    .from(clientSites)
    .where(
      and(eq(clientSites.id, siteId), eq(clientSites.clientId, clientId))
    )
    .limit(1);

  if (!site[0]) return null;

  return {
    siteUrl: site[0].url,
    basecampProjectId: site[0].basecampProjectId ?? undefined,
  };
}

/**
 * Generate context summary for display
 */
export function summarizeContext(context: ChatContext): string {
  const parts: string[] = [];

  if (context.basecampData) {
    parts.push(`Basecamp: ${context.basecampData.projectName}`);
    parts.push(`Active todos: ${context.basecampData.todos.length}`);
  }

  if (context.bricksData) {
    parts.push(`Page: ${context.bricksData.pageTitle}`);
    parts.push(`Elements: ${context.bricksData.elements.length}`);
  }

  if (context.recentMessages) {
    parts.push(`Recent messages: ${context.recentMessages.length}`);
  }

  return parts.join(" | ");
}

export default buildContext;
