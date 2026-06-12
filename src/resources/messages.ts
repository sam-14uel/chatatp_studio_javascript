import { Requester } from "../utils/requester.js";
import { PageIterator } from "../utils/paginator.js";
import type {
  Message,
  SendMessageParams,
  SendMessageResponse,
  StreamEvent,
  StreamEventType,
  Page,
} from "../types/index.js";

export class MessagesResource {
  constructor(private readonly requester: Requester) {}

  /** Fetch the full message history for a conversation */
  async list(conversationId: number): Promise<PageIterator<Message>> {
    const res = await this.requester.request<Page<Message>>(
      "GET",
      `/v1/conversations/${conversationId}/messages/`
    );
    return new PageIterator(res.data);
  }

  /** Send a message and return both the user and agent messages */
  async send(conversationId: number, params: SendMessageParams): Promise<SendMessageResponse> {
    return this.requester.request<SendMessageResponse>(
      "POST",
      `/v1/conversations/${conversationId}/messages/`,
      { body: params }
    );
  }

  /**
   * Stream a message response.
   * Returns an async generator that yields typed StreamEvent objects.
   *
   * @example
   * for await (const event of client.messages.stream(91, { content: "Hello" })) {
   *   if (event.type === "agent.response.completed") {
   *     console.log(event.data);
   *   }
   * }
   */
  stream(
    conversationId: number,
    params: SendMessageParams
  ): AsyncGenerator<StreamEvent> {
    const gen = this.requester.stream(
      `/v1/conversations/${conversationId}/messages/stream/`,
      params
    );
    return this.typedEvents(gen);
  }

  private async *typedEvents(
    source: AsyncGenerator<{ type: string; data: unknown }>
  ): AsyncGenerator<StreamEvent> {
    for await (const raw of source) {
      yield {
        type: raw.type as StreamEventType,
        data: raw.data,
      };
    }
  }
}
