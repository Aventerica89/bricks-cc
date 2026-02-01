export interface BasecampProject {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  purpose: string;
  clients_enabled: boolean;
  bookmark_url: string;
  url: string;
  app_url: string;
  dock: BasecampDock[];
  bookmarked: boolean;
}

export interface BasecampDock {
  id: number;
  title: string;
  name: string;
  enabled: boolean;
  position: number;
  url: string;
  app_url: string;
}

export interface BasecampTodoList {
  id: number;
  status: string;
  visible_to_clients: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  inherits_status: boolean;
  type: string;
  url: string;
  app_url: string;
  bookmark_url: string;
  subscription_url: string;
  comments_count: number;
  comments_url: string;
  position: number;
  parent: BasecampParent;
  bucket: BasecampBucket;
  creator: BasecampPerson;
  description: string;
  completed: boolean;
  completed_ratio: string;
  name: string;
  todos_url: string;
  groups_url: string;
  app_todos_url: string;
}

export interface BasecampTodo {
  id: number;
  status: string;
  visible_to_clients: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  inherits_status: boolean;
  type: string;
  url: string;
  app_url: string;
  bookmark_url: string;
  subscription_url: string;
  comments_count: number;
  comments_url: string;
  parent: BasecampParent;
  bucket: BasecampBucket;
  creator: BasecampPerson;
  description: string;
  completed: boolean;
  content: string;
  starts_on?: string;
  due_on?: string;
  assignees: BasecampPerson[];
  completion_subscribers: BasecampPerson[];
  completion_url: string;
}

export interface BasecampMessage {
  id: number;
  status: string;
  visible_to_clients: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  inherits_status: boolean;
  type: string;
  url: string;
  app_url: string;
  bookmark_url: string;
  subscription_url: string;
  comments_count: number;
  comments_url: string;
  parent: BasecampParent;
  bucket: BasecampBucket;
  creator: BasecampPerson;
  content: string;
  subject: string;
}

export interface BasecampPerson {
  id: number;
  attachable_sgid: string;
  name: string;
  email_address: string;
  personable_type: string;
  title: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  admin: boolean;
  owner: boolean;
  client: boolean;
  employee?: boolean;
  time_zone: string;
  avatar_url: string;
  company?: BasecampCompany;
  can_manage_projects?: boolean;
  can_manage_people?: boolean;
}

export interface BasecampParent {
  id: number;
  title: string;
  type: string;
  url: string;
  app_url: string;
}

export interface BasecampBucket {
  id: number;
  name: string;
  type: string;
}

export interface BasecampCompany {
  id: number;
  name: string;
}

export interface BasecampWebhook {
  id: number;
  created_at: string;
  updated_at: string;
  payload_url: string;
  types: string[];
  active: boolean;
  app_url: string;
  url: string;
}

export interface BasecampSyncRequest {
  feedbackId?: string;
  chatMessageId?: string;
  action: "create_todo" | "update_todo" | "fetch_projects";
  payload: Record<string, unknown>;
}

export interface BasecampSyncResponse {
  success: boolean;
  basecampId?: string;
  data?: unknown;
  error?: string;
}
