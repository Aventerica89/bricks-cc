export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    executionTime?: number;
    actions?: ChatAction[];
  };
}

export interface ChatAction {
  type: "bricks_edit" | "basecamp_create_todo" | "basecamp_update_todo";
  payload: Record<string, unknown>;
  status: "pending" | "completed" | "failed";
  error?: string;
}

export interface ChatRequest {
  clientId: string;
  siteId: string;
  message: string;
  context?: {
    currentPageId?: number;
    basecampProjectId?: number;
  };
}

export interface ChatResponse {
  response: string;
  actions?: ChatAction[];
  metadata: {
    tokensUsed?: number;
    executionTime: number;
  };
}

export interface ChatSession {
  id: string;
  clientId: string;
  siteId: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastMessageAt: Date;
}

export interface ChatContext {
  clientId: string;
  siteId: string;
  basecampData?: BasecampProjectData;
  bricksData?: BricksPageData;
  recentMessages?: ChatMessage[];
}

export interface BasecampProjectData {
  projectId: number;
  projectName: string;
  todos: ChatBasecampTodo[];
  milestones: ChatBasecampMilestone[];
}

export interface ChatBasecampTodo {
  id: number;
  content: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

export interface ChatBasecampMilestone {
  id: number;
  title: string;
  dueDate?: string;
  completed: boolean;
}

export interface BricksPageData {
  pageId: number;
  pageTitle: string;
  elements: ChatBricksElement[];
}

export interface ChatBricksElement {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  children?: ChatBricksElement[];
}
