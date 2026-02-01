import { NextRequest, NextResponse } from "next/server";
import { createBasecampClient } from "@/lib/basecamp";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const resource = searchParams.get("resource") || "summary";

  try {
    const basecampClient = createBasecampClient();

    if (!projectId) {
      // Return all projects
      const projects = await basecampClient.getProjects();
      return NextResponse.json({ projects });
    }

    const projectIdNum = parseInt(projectId, 10);

    switch (resource) {
      case "summary":
        const summary = await basecampClient.getProjectSummary(projectIdNum);
        return NextResponse.json({ summary });

      case "todos":
        const todoLists = await basecampClient.getTodoLists(projectIdNum);
        const allTodos = [];
        for (const list of todoLists) {
          const todos = await basecampClient.getTodos(projectIdNum, list.id);
          allTodos.push({ list, todos });
        }
        return NextResponse.json({ todoLists: allTodos });

      case "messages":
        const messages = await basecampClient.getMessages(projectIdNum);
        return NextResponse.json({ messages });

      case "project":
        const project = await basecampClient.getProject(projectIdNum);
        return NextResponse.json({ project });

      default:
        return NextResponse.json(
          { error: "Invalid resource type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Basecamp API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Basecamp data" },
      { status: 500 }
    );
  }
}
