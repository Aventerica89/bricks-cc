import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSessions, lessonScenarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { structureAgent } from "@/lib/agents/structure-agent";
import { CONFIDENCE_SCORING } from "@/lib/agents/constants";

// POST /api/build/sessions/[id]/execute - Execute agents for build session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [session] = await db
      .select()
      .from(buildSessions)
      .where(eq(buildSessions.id, id))
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: "Build session not found" },
        { status: 404 }
      );
    }

    // Load ALL scenarios from the lesson for few-shot examples
    let referenceScenarios: Array<{
      name: string;
      expectedOutput: Record<string, unknown>;
    }> = [];

    if (session.lessonId) {
      const allScenarios = await db
        .select()
        .from(lessonScenarios)
        .where(eq(lessonScenarios.lessonId, session.lessonId));

      referenceScenarios = allScenarios
        .filter((s) => s.expectedOutput !== null)
        .map((s) => ({
          name: s.name,
          expectedOutput: s.expectedOutput as Record<string, unknown>,
        }));
    } else if (session.scenarioId) {
      // If only scenarioId provided (no lessonId), load that single one
      const [scenario] = await db
        .select()
        .from(lessonScenarios)
        .where(eq(lessonScenarios.id, session.scenarioId))
        .limit(1);

      if (scenario?.expectedOutput) {
        referenceScenarios = [
          {
            name: scenario.name,
            expectedOutput: scenario.expectedOutput,
          },
        ];
      }
    }

    const inputData = session.inputData as {
      acssJsDump?: Record<string, unknown>;
      containerGridCode?: string;
      description?: string;
    };

    const result = await structureAgent.analyze({
      acssJsDump: inputData.acssJsDump,
      containerGridCode: inputData.containerGridCode,
      description: inputData.description,
      referenceScenarios,
    });

    const [updated] = await db
      .update(buildSessions)
      .set({
        agentOutputs: { structure: result },
        status:
          result.confidence >= CONFIDENCE_SCORING.AUTO_REVIEW_THRESHOLD
            ? "review"
            : "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(buildSessions.id, id))
      .returning();

    return NextResponse.json({
      session: updated,
      agentOutput: result,
    });
  } catch (error) {
    console.error("Error executing agents:", error);
    return NextResponse.json(
      { error: "Failed to execute agents" },
      { status: 500 }
    );
  }
}
