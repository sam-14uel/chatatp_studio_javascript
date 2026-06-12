import type { Agent, Conversation, Message, SendMessageResponse, Usage } from "../src/types/index.js";

export const mockAgent: Agent = {
  id: 7,
  name: "Support Agent",
  description: "Answers product questions.",
  status: "active",
  avatar_url: "https://example.com/avatar.png",
  capabilities: { persistent_conversations: true, streaming: true, tool_activity: true },
  created_at: "2026-06-12T00:00:00Z",
  updated_at: "2026-06-12T00:00:00Z",
};

export const mockConversation: Conversation = {
  id: 91,
  agent: mockAgent,
  external_user_id: "user_12345",
  user_display_name: "Jane Customer",
  metadata: { developer_api: true },
  message_count: 0,
  last_message_at: null,
  created_at: "2026-06-12T00:00:00Z",
  updated_at: "2026-06-12T00:00:00Z",
};

export const mockUserMessage: Message = {
  id: 501,
  sender: "user",
  content: "Do you ship to Lagos?",
  tool_calls: [],
  metadata: {},
  timestamp: "2026-06-12T00:00:00Z",
};

export const mockAgentMessage: Message = {
  id: 502,
  sender: "agent",
  content: "Yes, shipping is available.",
  tool_calls: [],
  metadata: {},
  timestamp: "2026-06-12T00:00:01Z",
};

export const mockSendResponse: SendMessageResponse = {
  conversation: { id: 91, external_user_id: "user_12345" },
  user_message: mockUserMessage,
  agent_message: mockAgentMessage,
};

export const mockUsage: Usage = {
  total_requests: 248,
  last_request_at: "2026-06-12T01:30:00Z",
  by_endpoint: [{ endpoint: "/v1/conversations/91/messages/", count: 120 }],
  by_status: [{ status_code: 200, count: 240 }],
};

/** Create a mock fetch that returns the given body */
export function mockFetch(status: number, body: unknown): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => body,
  });
}
