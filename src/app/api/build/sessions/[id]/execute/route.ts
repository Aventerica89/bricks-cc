import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSessions, lessonScenarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { structureAgent } from "@/lib/agents/structure-agent";

// POST /api/build/sessions/[id]/execute - Execute agents for build session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the build session
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

    // Get reference scenarios if lesson/scenario is specified
    let referenceScenarios: Array<{
      name: string;
      expectedOutput: Record<string, unknown>;
    }> = [];

    if (session.scenarioId) {
      const [scenario] = await db
        .select()
        .from(lessonScenarios)
        .where(eq(lessonScenarios.id, session.scenarioId))
        .limit(1);

      if (scenario && scenario.expectedOutput) {
        referenceScenarios = [
          {
            name: scenario.name,
            expectedOutput: scenario.expectedOutput,
          },
        ];
      }
    }

    // Execute Structure Agent (Phase 1: JavaScript)
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

    // Update session with agent output
    const [updated] = await db
      .update(buildSessions)
      .set({
        agentOutputs: {
          structure: result,
        },
        status: result.confidence > 0.7 ? "review" : "in_progress",
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
