import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, type NewLesson } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ZodError } from "zod";
import {
  createLessonSchema,
  generateLessonId,
} from "@/utils/validators";

// GET /api/teaching/lessons - List all lessons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const statusParam = searchParams.get("status");

    // Validate category if provided
    const validCategories = ["container-grids", "media-queries", "plugin-resources", "acss-docs"] as const;
    const validStatuses = ["draft", "published", "archived"] as const;

    if (categoryParam && !validCategories.includes(categoryParam as any)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    if (statusParam && !validStatuses.includes(statusParam as any)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Type-safe values after validation
    type ValidCategory = typeof validCategories[number];
    type ValidStatus = typeof validStatuses[number];
    const category = categoryParam as ValidCategory | null;
    const status = statusParam as ValidStatus | null;

    // Build query conditionally
    let allLessons;

    if (category && status) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(and(
          eq(lessons.category, category),
          eq(lessons.status, status)
        ))
        .orderBy(desc(lessons.createdAt));
    } else if (category) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.category, category))
        .orderBy(desc(lessons.createdAt));
    } else if (status) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.status, status))
        .orderBy(desc(lessons.createdAt));
    } else {
      allLessons = await db
        .select()
        .from(lessons)
        .orderBy(desc(lessons.createdAt));
    }

    return NextResponse.json({ lessons: allLessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// POST /api/teaching/lessons - Create new lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validated = createLessonSchema.parse(body);

    const newLesson: NewLesson = {
      id: generateLessonId(),
      title: validated.title,
      description: validated.description ?? null,
      category: validated.category,
      status: validated.status,
      orderIndex: validated.orderIndex,
      createdBy: validated.createdBy,
    };

    const [created] = await db.insert(lessons).values(newLesson).returning();

    return NextResponse.json({ lesson: created }, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
