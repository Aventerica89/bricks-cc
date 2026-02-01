import type { ChatRequest } from "@/types/chat";
import type { BricksEditRequest } from "@/types/bricks";
import type { ClientFeedbackRequest } from "@/types/client";

/**
 * Validate a chat request
 */
export function validateChatRequest(
  data: unknown
): { valid: true; data: ChatRequest } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const req = data as Record<string, unknown>;

  if (!req.clientId || typeof req.clientId !== "string") {
    return { valid: false, error: "clientId is required and must be a string" };
  }

  if (!req.siteId || typeof req.siteId !== "string") {
    return { valid: false, error: "siteId is required and must be a string" };
  }

  if (!req.message || typeof req.message !== "string") {
    return { valid: false, error: "message is required and must be a string" };
  }

  if (req.message.length > 10000) {
    return { valid: false, error: "message must be less than 10000 characters" };
  }

  return {
    valid: true,
    data: {
      clientId: req.clientId,
      siteId: req.siteId,
      message: req.message,
      context: req.context as ChatRequest["context"],
    },
  };
}

/**
 * Validate a Bricks edit request
 */
export function validateBricksEditRequest(
  data: unknown
): { valid: true; data: BricksEditRequest } | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const req = data as Record<string, unknown>;

  if (!req.siteId || typeof req.siteId !== "string") {
    return { valid: false, error: "siteId is required and must be a string" };
  }

  if (!req.pageId || typeof req.pageId !== "number") {
    return { valid: false, error: "pageId is required and must be a number" };
  }

  if (!Array.isArray(req.edits)) {
    return { valid: false, error: "edits is required and must be an array" };
  }

  for (const edit of req.edits) {
    if (!edit.elementId || typeof edit.elementId !== "string") {
      return {
        valid: false,
        error: "Each edit must have an elementId string",
      };
    }
    if (!edit.property || typeof edit.property !== "string") {
      return { valid: false, error: "Each edit must have a property string" };
    }
    if (edit.value === undefined) {
      return { valid: false, error: "Each edit must have a value" };
    }
  }

  return {
    valid: true,
    data: {
      siteId: req.siteId,
      pageId: req.pageId,
      edits: req.edits as BricksEditRequest["edits"],
    },
  };
}

/**
 * Validate a client feedback request
 */
export function validateFeedbackRequest(
  data: unknown
):
  | { valid: true; data: ClientFeedbackRequest }
  | { valid: false; error: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const req = data as Record<string, unknown>;

  if (!req.clientId || typeof req.clientId !== "string") {
    return { valid: false, error: "clientId is required and must be a string" };
  }

  if (!req.siteId || typeof req.siteId !== "string") {
    return { valid: false, error: "siteId is required and must be a string" };
  }

  if (!req.message || typeof req.message !== "string") {
    return { valid: false, error: "message is required and must be a string" };
  }

  const validTypes = ["bug", "feature", "general"];
  if (req.feedbackType && !validTypes.includes(req.feedbackType as string)) {
    return {
      valid: false,
      error: `feedbackType must be one of: ${validTypes.join(", ")}`,
    };
  }

  return {
    valid: true,
    data: {
      clientId: req.clientId,
      siteId: req.siteId,
      message: req.message,
      feedbackType: (req.feedbackType as "bug" | "feature" | "general") || "general",
      attachments: req.attachments as string[] | undefined,
    },
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
