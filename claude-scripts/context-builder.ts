#!/usr/bin/env npx tsx

/**
 * Context Builder for Claude CLI
 * Builds context from Basecamp and Bricks data for Claude processing
 */

import { createClient } from "@libsql/client";

interface ContextOptions {
  clientId: string;
  siteId: string;
  basecampProjectId?: number;
  pageId?: number;
  includeHistory?: boolean;
}

interface ContextResult {
  context: string;
  metadata: {
    clientId: string;
    siteId: string;
    hasBasecamp: boolean;
    hasBricks: boolean;
    messageCount: number;
  };
}

async function buildContext(options: ContextOptions): Promise<ContextResult> {
  const parts: string[] = [];
  const metadata = {
    clientId: options.clientId,
    siteId: options.siteId,
    hasBasecamp: false,
    hasBricks: false,
    messageCount: 0,
  };

  // Add client info
  parts.push(`Client ID: ${options.clientId}`);
  parts.push(`Site ID: ${options.siteId}`);
  parts.push("");

  // Try to fetch chat history from database
  if (options.includeHistory !== false) {
    try {
      const dbUrl = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;

      if (dbUrl) {
        const client = createClient({
          url: dbUrl,
          authToken,
        });

        const result = await client.execute({
          sql: `SELECT user_message, claude_response, created_at
                FROM chat_messages
                WHERE client_id = ? AND site_id = ?
                ORDER BY created_at DESC
                LIMIT 5`,
          args: [options.clientId, options.siteId],
        });

        if (result.rows.length > 0) {
          parts.push("## Recent Conversation");
          parts.push("");

          result.rows.reverse().forEach((row) => {
            parts.push(`User: ${row.user_message}`);
            if (row.claude_response) {
              parts.push(`Assistant: ${row.claude_response}`);
            }
            parts.push("");
          });

          metadata.messageCount = result.rows.length;
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  }

  // Try to fetch Basecamp data
  if (options.basecampProjectId) {
    try {
      const basecampData = await fetchBasecampData(options.basecampProjectId);
      if (basecampData) {
        parts.push("## Basecamp Project Data");
        parts.push("");
        parts.push(`Project: ${basecampData.projectName}`);

        if (basecampData.todos.length > 0) {
          parts.push("");
          parts.push("### Active Todos");
          basecampData.todos.forEach((todo) => {
            const status = todo.completed ? "[DONE]" : "[TODO]";
            parts.push(`- ${status} ${todo.content}`);
          });
        }

        parts.push("");
        metadata.hasBasecamp = true;
      }
    } catch (error) {
      console.error("Failed to fetch Basecamp data:", error);
    }
  }

  // Try to fetch Bricks page data
  if (options.pageId) {
    try {
      const pageData = await fetchBricksData(options.siteId, options.pageId);
      if (pageData) {
        parts.push("## Current Page");
        parts.push("");
        parts.push(`Page: ${pageData.title}`);
        parts.push(`Page ID: ${pageData.id}`);
        parts.push(`Elements: ${pageData.elementCount}`);
        parts.push("");
        metadata.hasBricks = true;
      }
    } catch (error) {
      console.error("Failed to fetch Bricks data:", error);
    }
  }

  return {
    context: parts.join("\n"),
    metadata,
  };
}

async function fetchBasecampData(projectId: number) {
  const accountId = process.env.BASECAMP_ACCOUNT_ID;
  const token = process.env.BASECAMP_OAUTH_TOKEN;

  if (!accountId || !token) {
    return null;
  }

  try {
    const response = await fetch(
      `https://3.basecampapi.com/${accountId}/projects/${projectId}.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "WP Manager Context Builder",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const project = await response.json();

    // Fetch todos
    const todosetDock = project.dock?.find(
      (d: { name: string }) => d.name === "todoset"
    );
    let todos: Array<{ content: string; completed: boolean }> = [];

    if (todosetDock) {
      const todoListsResponse = await fetch(
        `https://3.basecampapi.com/${accountId}/buckets/${projectId}/todosets/${todosetDock.id}/todolists.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "WP Manager Context Builder",
          },
        }
      );

      if (todoListsResponse.ok) {
        const todoLists = await todoListsResponse.json();

        for (const list of todoLists.slice(0, 3)) {
          const todosResponse = await fetch(
            `https://3.basecampapi.com/${accountId}/buckets/${projectId}/todolists/${list.id}/todos.json`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "WP Manager Context Builder",
              },
            }
          );

          if (todosResponse.ok) {
            const listTodos = await todosResponse.json();
            todos.push(
              ...listTodos
                .filter((t: { completed: boolean }) => !t.completed)
                .slice(0, 10)
            );
          }
        }
      }
    }

    return {
      projectName: project.name,
      todos: todos.slice(0, 10),
    };
  } catch (error) {
    console.error("Basecamp fetch error:", error);
    return null;
  }
}

async function fetchBricksData(siteId: string, pageId: number) {
  // This would normally query the database for site URL and credentials
  // For now, return placeholder data
  return {
    id: pageId,
    title: `Page ${pageId}`,
    elementCount: 0,
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  const options: ContextOptions = {
    clientId: "",
    siteId: "",
    includeHistory: true,
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--client-id":
        options.clientId = args[++i];
        break;
      case "--site-id":
        options.siteId = args[++i];
        break;
      case "--basecamp-project":
        options.basecampProjectId = parseInt(args[++i], 10);
        break;
      case "--page-id":
        options.pageId = parseInt(args[++i], 10);
        break;
      case "--no-history":
        options.includeHistory = false;
        break;
    }
  }

  if (!options.clientId || !options.siteId) {
    console.error("Usage: context-builder.ts --client-id <id> --site-id <id> [options]");
    console.error("Options:");
    console.error("  --basecamp-project <id>  Include Basecamp project data");
    console.error("  --page-id <id>           Include Bricks page data");
    console.error("  --no-history             Skip chat history");
    process.exit(1);
  }

  try {
    const result = await buildContext(options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error building context:", error);
    process.exit(1);
  }
}

main();
