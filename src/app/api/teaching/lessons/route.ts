import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, type NewLesson } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/teaching/lessons - List all lessons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = db.select().from(lessons);

    // Apply filters if provided
    if (category) {
      query = query.where(
        eq(lessons.category, category as "container-grids" | "media-queries" | "plugin-resources" | "acss-docs")
      );
    }

    if (status) {
      query = query.where(
        eq(lessons.status, status as "draft" | "published" | "archived")
      );
    }

    const allLessons = await query.orderBy(desc(lessons.createdAt));

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

    const newLesson: NewLesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description || null,
      category: body.category,
      status: body.status || "draft",
      orderIndex: body.orderIndex || 0,
      createdBy: body.createdBy || "admin",
    };

    const [created] = await db.insert(lessons).values(newLesson).returning();

    return NextResponse.json({ lesson: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
