import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, type NewLesson } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/teaching/lessons - List all lessons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build query conditionally
    let allLessons;

    if (category && status) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(and(
          eq(lessons.category, category as any),
          eq(lessons.status, status as any)
        ))
        .orderBy(desc(lessons.createdAt));
    } else if (category) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.category, category as any))
        .orderBy(desc(lessons.createdAt));
    } else if (status) {
      allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.status, status as any))
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
