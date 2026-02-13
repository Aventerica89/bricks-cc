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

  // Fetch Basecamp data — specific project or account-level project list
  try {
    const basecampClient = await createBasecampClientFromSettings();

    if (options.basecampProjectId) {
      // Specific project: fetch full summary
      const projectSummary = await basecampClient.getProjectSummary(
        options.basecampProjectId
      );
      context.basecampData = {
        projectId: projectSummary.project.id,
        projectName: projectSummary.project.name,
        todos: projectSummary.activeTodos.map((todo) => ({
          id: todo.id,
          content: todo.content,
          completed: todo.completed,
          dueDate: todo.due_on,
          assignee: todo.assignees?.[0]?.name,
        })),
        milestones: [],
      };
    } else {
      // No specific project: fetch all projects so Claude has data to work with
      const projects = await basecampClient.getProjects();
      context.basecampProjects = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        purpose: p.purpose,
        url: p.app_url,
      }));
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
