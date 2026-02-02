import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSessions, type NewBuildSession } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET /api/build/sessions - List all build sessions
export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(buildSessions)
      .orderBy(desc(buildSessions.createdAt));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching build sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch build sessions" },
      { status: 500 }
    );
  }
}

// POST /api/build/sessions - Create new build session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newSession: NewBuildSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lessonId: body.lessonId || null,
      scenarioId: body.scenarioId || null,
      phase: "javascript",
      status: "in_progress",
      inputData: body.inputData || {},
      agentOutputs: {},
      reviewNotes: [],
      finalOutput: null,
      createdBy: body.createdBy || "admin",
    };

    const [created] = await db.insert(buildSessions).values(newSession).returning();

    return NextResponse.json({ session: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating build session:", error);
    return NextResponse.json(
      { error: "Failed to create build session" },
      { status: 500 }
    );
  }
}
