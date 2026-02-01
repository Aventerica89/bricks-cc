export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  avatarUrl?: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ClientSite {
  id: string;
  clientId: string;
  name: string;
  url: string;
  wordpressApiUrl?: string | null;
  bricksApiKey?: string | null;
  basecampProjectId?: number | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ClientWithSites extends Client {
  sites: ClientSite[];
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  siteId: string;
  feedbackType: "bug" | "feature" | "general";
  message: string;
  attachments?: string[];
  basecampTodoId?: string;
  status: "pending" | "synced" | "resolved";
  createdAt: Date;
}

export interface ClientFeedbackRequest {
  clientId: string;
  siteId: string;
  feedbackType: "bug" | "feature" | "general";
  message: string;
  attachments?: string[];
}

export interface ClientFeedbackResponse {
  success: boolean;
  feedbackId: string;
  basecampTodoId?: string;
  error?: string;
}

export interface ClientSession {
  id: string;
  clientId: string;
  siteId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ClientMetadata {
  clientId: string;
  siteId: string;
  lastVisit?: Date;
  totalChats: number;
  totalFeedback: number;
  bricksEditsEnabled: boolean;
}
