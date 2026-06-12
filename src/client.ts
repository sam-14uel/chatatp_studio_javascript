import { Requester } from "./utils/requester.js";
import { AgentsResource } from "./resources/agents.js";
import { ConversationsResource } from "./resources/conversations.js";
import { MessagesResource } from "./resources/messages.js";
import { UsageResource } from "./resources/usage.js";
import type {
  ChatATPClientOptions,
  ChatParams,
  SendMessageResponse,
  StreamEvent,
} from "./types/index.js";

export class ChatATPClient {
  readonly agents: AgentsResource;
  readonly conversations: ConversationsResource;
  readonly messages: MessagesResource;
  readonly usage: UsageResource;

  private readonly requester: Requester;

  constructor(options: ChatATPClientOptions) {
    if (!options.apiKey) throw new Error("apiKey is required");
    this.requester = new Requester(options);
    this.agents = new AgentsResource(this.requester);
    this.conversations = new ConversationsResource(this.requester);
    this.messages = new MessagesResource(this.requester);
    this.usage = new UsageResource(this.requester);
  }

  // ──────────────────────────────────────────────
  // High-level chat interface
  // ──────────────────────────────────────────────

  /**
   * Send a message to an agent on behalf of a user.
   *
   * The SDK automatically creates or retrieves the underlying conversation,
   * so callers only need to supply the agent, the user, and the message.
   *
   * @example
   * const result = await client.chat({
   *   agent_id: 7,
   *   external_user_id: "user_12345",
   *   message: "Do you ship to Lagos?",
   * });
   * console.log(result.agent_message.content);
   */
  async chat(params: ChatParams): Promise<SendMessageResponse> {
    const conversation = await this.conversations.create({
      agent_id: params.agent_id,
      external_user_id: params.external_user_id,
      user_display_name: params.user_display_name,
      metadata: params.metadata,
    });
    return this.messages.send(conversation.id, {
      content: params.message,
    });
  }

  /**
   * Stream a message to an agent on behalf of a user.
   *
   * Like `chat()`, conversation lifecycle is handled automatically.
   *
   * @example
   * for await (const event of client.chatStream({
   *   agent_id: 7,
   *   external_user_id: "user_12345",
   *   message: "Do you ship to Lagos?",
   * })) {
   *   if (event.type === "agent.response.completed") {
   *     console.log(event.data);
   *   }
   * }
   */
  async *chatStream(params: ChatParams): AsyncGenerator<StreamEvent> {
    const conversation = await this.conversations.create({
      agent_id: params.agent_id,
      external_user_id: params.external_user_id,
      user_display_name: params.user_display_name,
      metadata: params.metadata,
    });
    yield* this.messages.stream(conversation.id, { content: params.message });
  }
}
