import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateLessonSchema } from "@/utils/teaching-validators";
import { ZodError } from "zod";

// GET /api/teaching/lessons/[id] - Get single lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, id))
      .limit(1);

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

// PUT /api/teaching/lessons/[id] - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input with Zod schema
    const validated = updateLessonSchema.parse(body);

    const [updated] = await db
      .update(lessons)
      .set({
        title: validated.title,
        description: validated.description,
        category: validated.category,
        status: validated.status,
        orderIndex: validated.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ lesson: updated });
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

    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE /api/teaching/lessons/[id] - Archive lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete by setting status to archived
    const [archived] = await db
      .update(lessons)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();

    if (!archived) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lesson: archived });
  } catch (error) {
    console.error("Error archiving lesson:", error);
    return NextResponse.json(
      { error: "Failed to archive lesson" },
      { status: 500 }
    );
  }
}
