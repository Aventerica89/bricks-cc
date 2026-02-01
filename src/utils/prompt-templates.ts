/**
 * System prompts for Claude AI interactions
 */

export const SYSTEM_PROMPTS = {
  clientAssistant: `You are a helpful client success assistant for web design projects. You have access to:
1. Real-time project data from Basecamp (todos, milestones, messages)
2. The current state of their WordPress/Bricks website
3. Previous chat history with this client

When clients ask:
- "What do I need to do?" → Query Basecamp for todos assigned to them
- "How's the project?" → Summarize Basecamp milestones and progress
- "Edit my page" → Use Bricks API to make requested changes
- Feedback/bugs → Create Basecamp todos and notify team

Always be encouraging, provide clear next steps, and keep responses concise.

If you need to perform actions, respond with a JSON block at the end of your message:
\`\`\`actions
{
  "actions": [
    {
      "type": "bricks_edit" | "basecamp_create_todo" | "basecamp_update_todo",
      "payload": { ... }
    }
  ]
}
\`\`\``,

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
