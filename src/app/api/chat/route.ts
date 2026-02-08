import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages } from "@/db/schema";
import { processWithClaude, buildContextString } from "@/lib/claude-cli";
import { buildContext } from "@/lib/context";
import { validateChatRequest, sanitizeInput } from "@/utils/validators";
import { SYSTEM_PROMPTS, parseActions } from "@/utils/prompt-templates";
import { generateId } from "@/utils/formatting";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import type { ChatResponse, ChatAction } from "@/types/chat";

// Force Node.js runtime (required for Anthropic SDK)
export const runtime = "nodejs";

/**
 * Parse WIDGET_ALLOWED_ORIGINS env var into a Set for O(1) lookup.
 * Supports comma-separated origins, e.g. "https://site1.com,https://site2.com"
 * A single "*" allows all origins (dev/testing only).
 */
function getAllowedOrigins(): Set<string> {
  const raw = process.env.WIDGET_ALLOWED_ORIGINS || "";
  if (!raw) return new Set();
  return new Set(raw.split(",").map((o) => o.trim()).filter(Boolean));
}

/**
 * Check if a request is cross-origin (widget) vs same-origin (dashboard).
 */
function isCrossOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("host") || "";
  try {
    const originHost = new URL(origin).host;
    return originHost !== host;
  } catch {
    return false;
  }
}

/**
 * Build CORS headers if the request origin is in the allowlist.
 * Returns empty headers object if origin is not allowed.
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin) return {};

  const allowed = getAllowedOrigins();
  if (allowed.size === 0) return {};

  const isAllowed = allowed.has("*") || allowed.has(origin);
  if (!isAllowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle CORS preflight requests from the embeddable widget.
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  if (!corsHeaders["Access-Control-Allow-Origin"]) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const crossOrigin = isCrossOriginRequest(request);
  const corsHeaders = crossOrigin ? getCorsHeaders(request) : {};

  try {
    // Cross-origin (widget): validate origin allowlist instead of CSRF
    // Same-origin (dashboard): use CSRF double-submit cookie pattern
    if (crossOrigin) {
      if (!corsHeaders["Access-Control-Allow-Origin"]) {
        return NextResponse.json(
          { error: "Origin not allowed" },
          { status: 403 }
        );
      }
    } else if (!validateCsrf(request)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Apply rate limiting
    const rateLimit = applyRateLimit(request, RATE_LIMITS.chat);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "X-RateLimit-Limit": RATE_LIMITS.chat.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = validateChatRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const { clientId, siteId, message, context: requestContext } = validation.data;

    // Build context from various sources
    const context = await buildContext({
      clientId,
      siteId,
      basecampProjectId: requestContext?.basecampProjectId,
      currentPageId: requestContext?.currentPageId,
      includeHistory: true,
      historyLimit: 5,
    });

    const contextString = buildContextString(context);

    // Process with Claude
    const startTime = Date.now();
    const claudeResponse = await processWithClaude({
      userMessage: message,
      context: contextString,
      systemPrompt: SYSTEM_PROMPTS.clientAssistant,
      siteId,
    });

    // Parse any actions from the response
    const { message: responseText, actions } = parseActions(
      claudeResponse.response
    );

    // Store in database (sanitize user input to prevent XSS)
    const messageId = generateId();
    await db.insert(chatMessages).values({
      id: messageId,
      clientId,
      siteId,
      userMessage: sanitizeInput(message),
      claudeResponse: sanitizeInput(responseText),
      metadata: {
        tokensUsed: claudeResponse.tokensUsed,
        executionTime: claudeResponse.executionTime,
      },
    });

    // Execute any actions
    const executedActions = await executeActions(actions, siteId);

    const response: ChatResponse = {
      response: responseText,
      actions: executedActions,
      metadata: {
        tokensUsed: claudeResponse.tokensUsed,
        executionTime: Date.now() - startTime,
      },
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function executeActions(
  actions: Array<{ type: string; payload: Record<string, unknown> }>,
  siteId: string
): Promise<ChatAction[]> {
  const results: ChatAction[] = [];
  const internalUrl = process.env.INTERNAL_API_URL || "http://localhost:3000";

  for (const action of actions) {
    try {
      switch (action.type) {
        case "bricks_edit":
          // Call Bricks API to apply edit (server-to-server)
          const bricksResponse = await fetch(
            `${internalUrl}/api/bricks/edit`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                siteId,
                pageId: action.payload.pageId,
                edits: [action.payload],
              }),
            }
          );
          const bricksResult = await bricksResponse.json();
          results.push({
            type: "bricks_edit" as const,
            payload: action.payload,
            status: bricksResult.success ? "completed" as const : "failed" as const,
            error: bricksResult.error,
          });
          break;

        case "basecamp_create_todo":
          // Call Basecamp API to create todo (server-to-server)
          const basecampResponse = await fetch(
            `${internalUrl}/api/basecamp/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create_todo",
                payload: action.payload,
              }),
            }
          );
          const basecampResult = await basecampResponse.json();
          results.push({
            type: "basecamp_create_todo" as const,
            payload: action.payload,
            status: basecampResult.success ? "completed" as const : "failed" as const,
            error: basecampResult.error,
          });
          break;

        default:
          results.push({
            type: action.type as ChatAction["type"],
            payload: action.payload,
            status: "pending" as const,
          });
      }
    } catch (error) {
      results.push({
        type: action.type as ChatAction["type"],
        payload: action.payload,
        status: "failed" as const,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const corsHeaders = isCrossOriginRequest(request)
    ? getCorsHeaders(request)
    : {};

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const siteId = searchParams.get("siteId");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  if (!clientId || !siteId) {
    return NextResponse.json(
      { error: "clientId and siteId are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const messages = await db.query.chatMessages.findMany({
      where: (msg, { and, eq }) =>
        and(eq(msg.clientId, clientId), eq(msg.siteId, siteId)),
      orderBy: (msg, { desc }) => [desc(msg.createdAt)],
      limit,
    });

    return NextResponse.json(
      { messages: messages.reverse() },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500, headers: corsHeaders }
    );
  }
}
