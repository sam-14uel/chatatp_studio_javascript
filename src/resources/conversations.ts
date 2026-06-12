import { Requester } from "../utils/requester.js";
import { PageIterator } from "../utils/paginator.js";
import type {
  Conversation,
  ConversationSummary,
  CreateConversationParams,
  ListConversationsParams,
  Page,
} from "../types/index.js";

export class ConversationsResource {
  constructor(private readonly requester: Requester) {}

  /**
   * Create or upsert a conversation.
   * If a conversation already exists for the given agent + external_user_id pair
   * the API returns the existing one.
   */
  async create(params: CreateConversationParams): Promise<Conversation> {
    return this.requester.request<Conversation>("POST", "/v1/conversations/", { body: params });
  }

  /** Retrieve a conversation by ID */
  async retrieve(conversationId: number): Promise<Conversation> {
    return this.requester.request<Conversation>("GET", `/v1/conversations/${conversationId}/`);
  }

  /** List conversations, optionally filtered by agent or external user */
  async list(params: ListConversationsParams = {}): Promise<PageIterator<ConversationSummary>> {
    const res = await this.requester.request<Page<ConversationSummary>>("GET", "/v1/conversations/", {
      query: {
        agent_id: params.agent_id,
        external_user_id: params.external_user_id,
      },
    });
    return new PageIterator(res.data);
  }

  /** Delete a conversation permanently */
  async delete(conversationId: number): Promise<void> {
    await this.requester.request<void>("DELETE", `/v1/conversations/${conversationId}/`);
  }
}
