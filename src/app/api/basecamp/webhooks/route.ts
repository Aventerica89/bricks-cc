import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { basecampSync, clientFeedback } from "@/db/schema";
import { eq } from "drizzle-orm";

interface BasecampWebhookPayload {
  id: number;
  kind: string;
  creator: {
    id: number;
    name: string;
  };
  details: Record<string, unknown>;
  created_at: string;
  recording: {
    id: number;
    type: string;
    title?: string;
    content?: string;
    bucket: {
      id: number;
      name: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as BasecampWebhookPayload;

    console.log("Basecamp webhook received:", payload.kind);

    // Handle different webhook events
    switch (payload.kind) {
      case "todo_completed":
        await handleTodoCompleted(payload);
        break;

      case "todo_uncompleted":
        await handleTodoUncompleted(payload);
        break;

      case "todo_created":
        await handleTodoCreated(payload);
        break;

      case "message_created":
        await handleMessageCreated(payload);
        break;

      default:
        console.log("Unhandled webhook event:", payload.kind);
    }

    // Update last sync timestamp
    await db
      .update(basecampSync)
      .set({ lastSync: new Date() })
      .where(eq(basecampSync.basecampProjectId, payload.recording.bucket.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Basecamp webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleTodoCompleted(payload: BasecampWebhookPayload) {
  const todoId = String(payload.recording.id);

  // Update any linked feedback
  await db
    .update(clientFeedback)
    .set({ status: "resolved" })
    .where(eq(clientFeedback.basecampTodoId, todoId));

  console.log(`Todo ${todoId} marked as completed`);
}

async function handleTodoUncompleted(payload: BasecampWebhookPayload) {
  const todoId = String(payload.recording.id);

  // Update any linked feedback
  await db
    .update(clientFeedback)
    .set({ status: "synced" })
    .where(eq(clientFeedback.basecampTodoId, todoId));

  console.log(`Todo ${todoId} marked as uncompleted`);
}

async function handleTodoCreated(payload: BasecampWebhookPayload) {
  console.log(
    `New todo created: ${payload.recording.title || payload.recording.id}`
  );
  // Could trigger notifications or update dashboards
}

async function handleMessageCreated(payload: BasecampWebhookPayload) {
  console.log(
    `New message created: ${payload.recording.title || payload.recording.id}`
  );
  // Could trigger notifications or update chat context
}

// Verify webhook signature (if Basecamp provides one)
function verifyWebhookSignature(
  request: NextRequest,
  payload: string
): boolean {
  const signature = request.headers.get("X-Basecamp-Signature");

  if (!signature) {
    return true; // Basecamp may not always send signatures
  }

  // Implement signature verification if needed
  // const expectedSignature = crypto.createHmac('sha256', process.env.BASECAMP_WEBHOOK_SECRET!)
  //   .update(payload)
  //   .digest('hex');

  return true;
}
