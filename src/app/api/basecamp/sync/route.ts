import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientFeedback, basecampSync } from "@/db/schema";
import { createBasecampClient } from "@/lib/basecamp";
import { eq } from "drizzle-orm";
import type { BasecampSyncRequest, BasecampSyncResponse } from "@/types/basecamp";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BasecampSyncRequest;
    const { feedbackId, action, payload } = body;

    const basecampClient = createBasecampClient();

    let response: BasecampSyncResponse;

    switch (action) {
      case "create_todo":
        // Create todo from feedback or direct request
        const { projectId, todoListId, content, description, dueOn } =
          payload as {
            projectId: number;
            todoListId: number;
            content: string;
            description?: string;
            dueOn?: string;
          };

        const newTodo = await basecampClient.createTodo(
          projectId,
          todoListId,
          content,
          {
            description,
            due_on: dueOn,
          }
        );

        // Update feedback record if this came from feedback
        if (feedbackId) {
          await db
            .update(clientFeedback)
            .set({
              basecampTodoId: String(newTodo.id),
              status: "synced",
            })
            .where(eq(clientFeedback.id, feedbackId));
        }

        response = {
          success: true,
          basecampId: String(newTodo.id),
          data: newTodo,
        };
        break;

      case "update_todo":
        const { todoId, updates } = payload as {
          projectId: number;
          todoId: number;
          updates: {
            content?: string;
            description?: string;
            completed?: boolean;
          };
        };

        if (updates.completed !== undefined) {
          if (updates.completed) {
            await basecampClient.completeTodo(
              payload.projectId as number,
              todoId
            );
          } else {
            await basecampClient.uncompleteTodo(
              payload.projectId as number,
              todoId
            );
          }
        }

        const updatedTodo = await basecampClient.updateTodo(
          payload.projectId as number,
          todoId,
          {
            content: updates.content,
            description: updates.description,
          }
        );

        response = {
          success: true,
          basecampId: String(todoId),
          data: updatedTodo,
        };
        break;

      case "fetch_projects":
        const projects = await basecampClient.getProjects();
        response = {
          success: true,
          data: { projects },
        };
        break;

      default:
        response = {
          success: false,
          error: "Invalid action",
        };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Basecamp sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync",
      } as BasecampSyncResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400 });
  }

  try {
    const syncConfig = await db.query.basecampSync.findFirst({
      where: eq(basecampSync.siteId, siteId),
    });

    if (!syncConfig) {
      return NextResponse.json({
        configured: false,
        message: "Basecamp sync not configured for this site",
      });
    }

    return NextResponse.json({
      configured: true,
      status: syncConfig.syncStatus,
      lastSync: syncConfig.lastSync,
      projectId: syncConfig.basecampProjectId,
    });
  } catch (error) {
    console.error("Basecamp sync status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
