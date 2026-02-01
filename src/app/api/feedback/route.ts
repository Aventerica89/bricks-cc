import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientFeedback, clientSites, basecampSync } from "@/db/schema";
import { createBasecampClient } from "@/lib/basecamp";
import { validateFeedbackRequest, sanitizeInput } from "@/utils/validators";
import { generateId } from "@/utils/formatting";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { eq, desc, and } from "drizzle-orm";
import type { ClientFeedbackResponse } from "@/types/client";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = applyRateLimit(request, RATE_LIMITS.feedback);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMITS.feedback.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate request
    const validation = validateFeedbackRequest(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { clientId, siteId, feedbackType, message, attachments } =
      validation.data;

    const feedbackId = generateId();

    // Insert feedback (sanitize message to prevent XSS)
    await db.insert(clientFeedback).values({
      id: feedbackId,
      clientId,
      siteId,
      feedbackType,
      message: sanitizeInput(message),
      attachments,
      status: "pending",
    });

    // Try to sync to Basecamp if configured
    let basecampTodoId: string | undefined;

    try {
      const syncConfig = await db.query.basecampSync.findFirst({
        where: eq(basecampSync.siteId, siteId),
      });

      if (syncConfig && syncConfig.syncStatus === "active") {
        const basecampClient = createBasecampClient();

        // Get the first todo list from the project
        const todoLists = await basecampClient.getTodoLists(
          syncConfig.basecampProjectId
        );

        if (todoLists.length > 0) {
          const todoContent = `[${feedbackType?.toUpperCase() || "FEEDBACK"}] ${message.substring(0, 100)}${message.length > 100 ? "..." : ""}`;

          const todo = await basecampClient.createTodo(
            syncConfig.basecampProjectId,
            todoLists[0].id,
            todoContent,
            {
              description: `Full feedback:\n\n${message}\n\nSubmitted by client: ${clientId}`,
            }
          );

          basecampTodoId = String(todo.id);

          // Update feedback with Basecamp todo ID
          await db
            .update(clientFeedback)
            .set({
              basecampTodoId,
              status: "synced",
            })
            .where(eq(clientFeedback.id, feedbackId));
        }
      }
    } catch (basecampError) {
      console.error("Failed to sync feedback to Basecamp:", basecampError);
      // Don't fail the request, just log the error
    }

    const response: ClientFeedbackResponse = {
      success: true,
      feedbackId,
      basecampTodoId,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      {
        success: false,
        feedbackId: "",
        error: "Failed to submit feedback",
      } as ClientFeedbackResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    let whereClause;

    if (clientId && siteId && status) {
      whereClause = and(
        eq(clientFeedback.clientId, clientId),
        eq(clientFeedback.siteId, siteId),
        eq(clientFeedback.status, status as "pending" | "synced" | "resolved")
      );
    } else if (clientId && siteId) {
      whereClause = and(
        eq(clientFeedback.clientId, clientId),
        eq(clientFeedback.siteId, siteId)
      );
    } else if (siteId) {
      whereClause = eq(clientFeedback.siteId, siteId);
    } else if (clientId) {
      whereClause = eq(clientFeedback.clientId, clientId);
    }

    const feedback = await db.query.clientFeedback.findMany({
      where: whereClause,
      orderBy: [desc(clientFeedback.createdAt)],
      limit,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedbackId, status } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { error: "feedbackId is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "synced", "resolved"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    await db
      .update(clientFeedback)
      .set({ status })
      .where(eq(clientFeedback.id, feedbackId));

    const updatedFeedback = await db.query.clientFeedback.findFirst({
      where: eq(clientFeedback.id, feedbackId),
    });

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error) {
    console.error("Feedback update error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
