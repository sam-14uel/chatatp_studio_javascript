// Client
export { ChatATPClient } from "./client.js";

// Errors
export {
  ChatATPError,
  AuthenticationError,
  PermissionError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  ServerError,
  NetworkError,
  TimeoutError,
} from "./errors/index.js";

// Resources (for advanced use / type augmentation)
export { AgentsResource } from "./resources/agents.js";
export { ConversationsResource } from "./resources/conversations.js";
export { MessagesResource } from "./resources/messages.js";
export { UsageResource } from "./resources/usage.js";

// Utilities
export { PageIterator } from "./utils/paginator.js";

// All types
export type {
  Agent,
  AgentCapabilities,
  Conversation,
  ConversationSummary,
  Message,
  SendMessageResponse,
  Usage,
  StreamEvent,
  StreamEventType,
  CreateConversationParams,
  ListConversationsParams,
  SendMessageParams,
  ChatParams,
  ChatATPClientOptions,
  Page,
} from "./types/index.js";
