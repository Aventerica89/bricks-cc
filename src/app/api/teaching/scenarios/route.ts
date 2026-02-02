import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonScenarios, type NewLessonScenario } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/teaching/scenarios - List scenarios (optionally filtered by lessonId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    let query = db.select().from(lessonScenarios);

    if (lessonId) {
      query = query.where(eq(lessonScenarios.lessonId, lessonId));
    }

    const scenarios = await query;

    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }
}

// POST /api/teaching/scenarios - Create new scenario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newScenario: NewLessonScenario = {
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lessonId: body.lessonId,
      name: body.name,
      acssJsDump: body.acssJsDump || null,
      screenshotBeforeUrl: body.screenshotBeforeUrl || null,
      screenshotAfterUrl: body.screenshotAfterUrl || null,
      correctContainerGridCode: body.correctContainerGridCode || null,
      cssHandlingRules: body.cssHandlingRules || null,
      validationRules: body.validationRules || null,
      expectedOutput: body.expectedOutput || null,
    };

    const [created] = await db
      .insert(lessonScenarios)
      .values(newScenario)
      .returning();

    return NextResponse.json({ scenario: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating scenario:", error);
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }
}
