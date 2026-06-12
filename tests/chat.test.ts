import { ChatATPClient } from "../src/client.js";
import { mockFetch, mockConversation, mockSendResponse } from "./fixtures.js";

describe("High-level chat interface", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    client = new ChatATPClient({ apiKey: "chatatp_sk_test" });
  });

  it("chat() creates conversation then sends message", async () => {
    // First call: create conversation. Second call: send message.
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => mockConversation,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => mockSendResponse,
      });

    global.fetch = fetchMock;

    const result = await client.chat({
      agent_id: 7,
      external_user_id: "user_12345",
      message: "Do you ship to Lagos?",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.agent_message.content).toBe("Yes, shipping is available.");
  });

  it("chat() passes user display name to conversation creation", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => mockConversation,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => mockSendResponse,
      });

    global.fetch = fetchMock;

    await client.chat({
      agent_id: 7,
      external_user_id: "user_12345",
      user_display_name: "Jane Customer",
      message: "Hello",
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.user_display_name).toBe("Jane Customer");
  });
});
