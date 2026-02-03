import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonScenarios, type NewLessonScenario } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createScenarioSchema, generateScenarioId } from "@/utils/teaching-validators";
import { ZodError } from "zod";

// GET /api/teaching/scenarios - List scenarios (optionally filtered by lessonId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    const scenarios = lessonId
      ? await db
          .select()
          .from(lessonScenarios)
          .where(eq(lessonScenarios.lessonId, lessonId))
      : await db.select().from(lessonScenarios);

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

    // Validate input with Zod schema
    const validated = createScenarioSchema.parse(body);

    const newScenario: NewLessonScenario = {
      id: generateScenarioId(),
      lessonId: validated.lessonId,
      name: validated.name,
      acssJsDump: validated.acssJsDump,
      screenshotBeforeUrl: validated.screenshotBeforeUrl,
      screenshotAfterUrl: validated.screenshotAfterUrl,
      correctContainerGridCode: validated.correctContainerGridCode,
      cssHandlingRules: validated.cssHandlingRules,
      validationRules: validated.validationRules,
      expectedOutput: validated.expectedOutput,
    };

    const [created] = await db
      .insert(lessonScenarios)
      .values(newScenario)
      .returning();

    return NextResponse.json({ scenario: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating scenario:", error);
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }
}
