import type {
  BasecampProject,
  BasecampTodoList,
  BasecampTodo,
  BasecampMessage,
} from "@/types/basecamp";

const BASECAMP_API_BASE = "https://3.basecampapi.com";

interface BasecampConfig {
  accountId: number;
  accessToken: string;
  userAgent?: string;
}

export class BasecampClient {
  private config: BasecampConfig;
  private baseUrl: string;

  constructor(config: BasecampConfig) {
    this.config = config;
    this.baseUrl = `${BASECAMP_API_BASE}/${config.accountId}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
        "User-Agent":
          this.config.userAgent || "WP Manager Claude Integration (contact@example.com)",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Basecamp API error: ${response.status} ${response.statusText} - ${error}`
      );
    }

    return response.json();
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<BasecampProject[]> {
    return this.request<BasecampProject[]>("/projects.json");
  }

  /**
   * Get a specific project
   */
  async getProject(projectId: number): Promise<BasecampProject> {
    return this.request<BasecampProject>(`/projects/${projectId}.json`);
  }

  /**
   * Get todo lists for a project
   */
  async getTodoLists(projectId: number): Promise<BasecampTodoList[]> {
    const project = await this.getProject(projectId);
    const todosetDock = project.dock.find((d) => d.name === "todoset");

    if (!todosetDock) {
      return [];
    }

    const todosetId = todosetDock.id;
    return this.request<BasecampTodoList[]>(
      `/buckets/${projectId}/todosets/${todosetId}/todolists.json`
    );
  }

  /**
   * Get todos from a todo list
   */
  async getTodos(projectId: number, todoListId: number): Promise<BasecampTodo[]> {
    return this.request<BasecampTodo[]>(
      `/buckets/${projectId}/todolists/${todoListId}/todos.json`
    );
  }

  /**
   * Create a new todo
   */
  async createTodo(
    projectId: number,
    todoListId: number,
    content: string,
    options: {
      description?: string;
      assignee_ids?: number[];
      due_on?: string;
      starts_on?: string;
    } = {}
  ): Promise<BasecampTodo> {
    return this.request<BasecampTodo>(
      `/buckets/${projectId}/todolists/${todoListId}/todos.json`,
      {
        method: "POST",
        body: JSON.stringify({
          content,
          ...options,
        }),
      }
    );
  }

  /**
   * Complete a todo
   */
  async completeTodo(projectId: number, todoId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: "POST",
    });
  }

  /**
   * Uncomplete a todo
   */
  async uncompleteTodo(projectId: number, todoId: number): Promise<void> {
    await this.request(`/buckets/${projectId}/todos/${todoId}/completion.json`, {
      method: "DELETE",
    });
  }

  /**
   * Update a todo
   */
  async updateTodo(
    projectId: number,
    todoId: number,
    updates: {
      content?: string;
      description?: string;
      assignee_ids?: number[];
      due_on?: string;
      starts_on?: string;
    }
  ): Promise<BasecampTodo> {
    return this.request<BasecampTodo>(
      `/buckets/${projectId}/todos/${todoId}.json`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Get messages from a project message board
   */
  async getMessages(projectId: number): Promise<BasecampMessage[]> {
    const project = await this.getProject(projectId);
    const messageboardDock = project.dock.find(
      (d) => d.name === "message_board"
    );

    if (!messageboardDock) {
      return [];
    }

    const messageboardId = messageboardDock.id;
    return this.request<BasecampMessage[]>(
      `/buckets/${projectId}/message_boards/${messageboardId}/messages.json`
    );
  }

  /**
   * Create a message in the project message board
   */
  async createMessage(
    projectId: number,
    subject: string,
    content: string,
    options: {
      status?: string;
      category_id?: number;
    } = {}
  ): Promise<BasecampMessage> {
    const project = await this.getProject(projectId);
    const messageboardDock = project.dock.find(
      (d) => d.name === "message_board"
    );

    if (!messageboardDock) {
      throw new Error("Project does not have a message board");
    }

    const messageboardId = messageboardDock.id;
    return this.request<BasecampMessage>(
      `/buckets/${projectId}/message_boards/${messageboardId}/messages.json`,
      {
        method: "POST",
        body: JSON.stringify({
          subject,
          content,
          ...options,
        }),
      }
    );
  }

  /**
   * Get project summary for chat context
   */
  async getProjectSummary(projectId: number): Promise<{
    project: BasecampProject;
    todoLists: BasecampTodoList[];
    activeTodos: BasecampTodo[];
    recentMessages: BasecampMessage[];
  }> {
    const project = await this.getProject(projectId);
    const todoLists = await this.getTodoLists(projectId);

    // Get all active todos from all lists
    const allTodos: BasecampTodo[] = [];
    for (const list of todoLists) {
      const todos = await this.getTodos(projectId, list.id);
      allTodos.push(...todos.filter((t) => !t.completed));
    }

    const recentMessages = await this.getMessages(projectId);

    return {
      project,
      todoLists,
      activeTodos: allTodos.slice(0, 20), // Limit to 20 most recent
      recentMessages: recentMessages.slice(0, 10), // Limit to 10 most recent
    };
  }
}

/**
 * Create a Basecamp client from environment variables
 * Or from encrypted token (automatically decrypts)
 */
export function createBasecampClient(options?: {
  accountId?: number;
  encryptedToken?: string;
}): BasecampClient {
  if (options?.encryptedToken && options?.accountId) {
    // Use provided encrypted token (decrypt it)
    const { decryptBasecampToken } = require("./secure-keys");
    const accessToken = decryptBasecampToken(options.encryptedToken);

    if (!accessToken) {
      throw new Error("Failed to decrypt Basecamp token");
    }

    return new BasecampClient({
      accountId: options.accountId,
      accessToken,
      userAgent: process.env.BASECAMP_USER_AGENT,
    });
  }

  // Fallback to environment variables
  const accountId = process.env.BASECAMP_ACCOUNT_ID;
  const accessToken = process.env.BASECAMP_OAUTH_TOKEN;

  if (!accountId || !accessToken) {
    throw new Error(
      "Missing Basecamp configuration. Set BASECAMP_ACCOUNT_ID and BASECAMP_OAUTH_TOKEN."
    );
  }

  return new BasecampClient({
    accountId: parseInt(accountId, 10),
    accessToken,
    userAgent: process.env.BASECAMP_USER_AGENT,
  });
}

export default BasecampClient;
