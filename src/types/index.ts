// ──────────────────────────────────────────────
// Core model types mirroring the Developer API
// ──────────────────────────────────────────────

export interface AgentCapabilities {
  persistent_conversations: boolean;
  streaming: boolean;
  tool_activity: boolean;
}

export interface Agent {
  id: number;
  name: string;
  description: string;
  status: string;
  avatar_url: string;
  capabilities: AgentCapabilities;
  created_at: string;
  updated_at: string;
}

export interface ConversationSummary {
  id: number;
  external_user_id: string;
}

export interface Conversation {
  id: number;
  agent: Agent;
  external_user_id: string;
  user_display_name: string | null;
  metadata: Record<string, unknown>;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender: "user" | "agent";
  content: string;
  tool_calls: unknown[];
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface SendMessageResponse {
  conversation: ConversationSummary;
  user_message: Message;
  agent_message: Message;
}

export interface Usage {
  total_requests: number;
  last_request_at: string | null;
  by_endpoint: Array<{ endpoint: string; count: number }>;
  by_status: Array<{ status_code: number; count: number }>;
}

// ──────────────────────────────────────────────
// Streaming
// ──────────────────────────────────────────────

export type StreamEventType =
  | "conversation.message.created"
  | "message.created"
  | "tool.execution.completed"
  | "agent.response.completed"
  | "completion.completed";

export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  data: T;
}

// ──────────────────────────────────────────────
// Request option types
// ──────────────────────────────────────────────

export interface CreateConversationParams {
  agent_id: number;
  external_user_id: string;
  user_display_name?: string;
  metadata?: Record<string, unknown>;
}

export interface ListConversationsParams {
  agent_id?: number;
  external_user_id?: string;
}

export interface SendMessageParams {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatParams {
  agent_id: number;
  external_user_id: string;
  message: string;
  user_display_name?: string;
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────────────────
// Client configuration
// ──────────────────────────────────────────────

export interface ChatATPClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}

// ──────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────

export interface Page<T> {
  data: T[];
}
