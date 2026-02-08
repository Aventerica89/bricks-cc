import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessonScenarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateScenarioSchema } from "@/utils/teaching-validators";
import { ZodError } from "zod";

// GET /api/teaching/scenarios/[id] - Get single scenario
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [scenario] = await db
      .select()
      .from(lessonScenarios)
      .where(eq(lessonScenarios.id, id))
      .limit(1);

    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ scenario });
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenario" },
      { status: 500 }
    );
  }
}

// PUT /api/teaching/scenarios/[id] - Update scenario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validated = updateScenarioSchema.parse(body);

    // Clean empty strings to null for URL fields
    const cleanedData = {
      ...validated,
      screenshotBeforeUrl:
        validated.screenshotBeforeUrl === ""
          ? null
          : validated.screenshotBeforeUrl,
      screenshotAfterUrl:
        validated.screenshotAfterUrl === ""
          ? null
          : validated.screenshotAfterUrl,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(lessonScenarios)
      .set(cleanedData)
      .where(eq(lessonScenarios.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ scenario: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Failed to update scenario" },
      { status: 500 }
    );
  }
}

// DELETE /api/teaching/scenarios/[id] - Delete scenario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(lessonScenarios)
      .where(eq(lessonScenarios.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Failed to delete scenario" },
      { status: 500 }
    );
  }
}
