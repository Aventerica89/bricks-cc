/**
 * System prompts for Claude AI interactions
 */

export const SYSTEM_PROMPTS = {
  clientAssistant: `You are a helpful project management assistant. You have access to Basecamp project data and WordPress/Bricks websites.

IMPORTANT: Your CONTEXT section below already contains Basecamp project data (project list, todos, messages). Use that data directly to answer questions — do NOT emit a basecamp_query action unless you need data that is not already in the context.

When users ask about project status, todos, or progress, answer from the context data provided.

If you need to CREATE or MODIFY data, use an actions block:
\`\`\`actions
{
  "actions": [
    {
      "type": "basecamp_create_todo",
      "payload": { "projectId": 123, "todoListId": 456, "content": "Task name", "description": "Details" }
    }
  ]
}
\`\`\`

Supported action types:
- basecamp_create_todo: Create a new todo (requires projectId, todoListId, content)
- basecamp_update_todo: Update an existing todo (requires projectId, todoId, updates)
- basecamp_query: Fetch fresh data for a specific project (requires projectId, resource: "todos"|"messages"|"summary")
- bricks_edit: Edit a page element (requires pageId, elementId, property, value)

If no actions are needed, just respond with text — no actions block required.
Be concise and actionable. Focus on what matters most.`,

  bricksEditor: `You are a web design expert specializing in Bricks Builder.
When given edit requests, you:
1. Understand the current page structure
2. Suggest/apply CSS and layout changes
3. Provide reasoning for changes
4. Ask clarifying questions if needed

For each edit request, analyze the page elements provided in context and determine:
- Which element(s) need to be modified
- What property changes are needed
- Any potential side effects

Respond with a JSON block containing the Bricks API calls needed:
\`\`\`bricks_edit
{
  "edits": [
    {
      "elementId": "element-id",
      "property": "settings._typography.color",
      "value": "#ff0000"
    }
  ],
  "explanation": "Changed the heading color to red as requested."
}
\`\`\``,

  feedbackHandler: `You are a helpful assistant that processes client feedback.
Your role is to:
1. Categorize feedback (bug, feature request, or general comment)
2. Summarize the issue clearly
3. Create appropriate Basecamp todos
4. Acknowledge the client's feedback

Always be empathetic and professional. Let clients know their feedback is valued.`,

  projectStatus: `You are a project status reporter for web design projects.
Given Basecamp project data, provide:
1. Overall project progress
2. Upcoming milestones
3. Pending client tasks
4. Recent activity summary

Be concise and focus on actionable information.`,
};

/**
 * Build a complete prompt with context
 */
export function buildPrompt(
  template: keyof typeof SYSTEM_PROMPTS,
  context: string,
  userMessage: string
): string {
  return `${SYSTEM_PROMPTS[template]}

---
CONTEXT:
${context}
---

USER MESSAGE:
${userMessage}`;
}

/**
 * Parse actions from Claude's response
 */
export function parseActions(
  response: string
): {
  message: string;
  actions: Array<{
    type: string;
    payload: Record<string, unknown>;
  }>;
} {
  // Look for actions JSON block
  const actionsMatch = response.match(
    /```(?:actions|bricks_edit)\n([\s\S]*?)\n```/
  );

  if (!actionsMatch) {
    return {
      message: response,
      actions: [],
    };
  }

  try {
    const actionsJson = JSON.parse(actionsMatch[1]);
    const message = response.replace(actionsMatch[0], "").trim();

    return {
      message,
      actions: actionsJson.actions || actionsJson.edits?.map((edit: Record<string, unknown>) => ({
        type: "bricks_edit",
        payload: edit,
      })) || [],
    };
  } catch {
    return {
      message: response,
      actions: [],
    };
  }
}

/**
 * Format actions for display
 */
export function formatActionsSummary(
  actions: Array<{ type: string; payload: Record<string, unknown> }>
): string {
  if (actions.length === 0) return "";

  const summaries = actions.map((action) => {
    switch (action.type) {
      case "bricks_edit":
        return `Modified element: ${action.payload.elementId}`;
      case "basecamp_create_todo":
        return `Created todo: ${action.payload.content}`;
      case "basecamp_update_todo":
        return `Updated todo: ${action.payload.todoId}`;
      default:
        return `Action: ${action.type}`;
    }
  });

  return `\n\n**Actions taken:** ${summaries.join(", ")}`;
}

export default SYSTEM_PROMPTS;
