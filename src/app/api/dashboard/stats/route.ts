import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, lessonScenarios, buildSessions } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const [totalLessons] = await db
      .select({ count: count() })
      .from(lessons);

    const [publishedLessons] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.status, "published"));

    const [totalScenarios] = await db
      .select({ count: count() })
      .from(lessonScenarios);

    const [totalBuildSessions] = await db
      .select({ count: count() })
      .from(buildSessions);

    return NextResponse.json({
      totalLessons: totalLessons.count,
      publishedLessons: publishedLessons.count,
      totalScenarios: totalScenarios.count,
      totalBuildSessions: totalBuildSessions.count,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
