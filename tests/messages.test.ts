import { ChatATPClient } from "../src/client.js";
import { mockFetch, mockSendResponse, mockUserMessage, mockAgentMessage } from "./fixtures.js";

describe("MessagesResource", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    client = new ChatATPClient({ apiKey: "chatatp_sk_test" });
  });

  it("list() returns a PageIterator of messages", async () => {
    global.fetch = mockFetch(200, {
      data: [mockUserMessage, mockAgentMessage],
    });
    const page = await client.messages.list(91);
    expect(page.data).toHaveLength(2);
    expect(page.data[0].sender).toBe("user");
    expect(page.data[1].sender).toBe("agent");
  });

  it("send() returns user and agent messages", async () => {
    global.fetch = mockFetch(200, mockSendResponse);
    const result = await client.messages.send(91, { content: "Do you ship to Lagos?" });
    expect(result.user_message.content).toBe("Do you ship to Lagos?");
    expect(result.agent_message.content).toBe("Yes, shipping is available.");
  });

  it("send() sends to correct endpoint", async () => {
    global.fetch = mockFetch(200, mockSendResponse);
    await client.messages.send(91, { content: "Hi" });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/v1/conversations/91/messages/");
  });
});
