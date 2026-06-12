import { ChatATPClient } from "../src/client.js";
import { mockFetch, mockConversation } from "./fixtures.js";

describe("ConversationsResource", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    client = new ChatATPClient({ apiKey: "chatatp_sk_test" });
  });

  it("create() posts to /v1/conversations/", async () => {
    global.fetch = mockFetch(200, mockConversation);
    const conv = await client.conversations.create({
      agent_id: 7,
      external_user_id: "user_12345",
    });
    expect(conv.id).toBe(91);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/v1/conversations/");
    expect(init.method).toBe("POST");
  });

  it("retrieve() calls the correct endpoint", async () => {
    global.fetch = mockFetch(200, mockConversation);
    await client.conversations.retrieve(91);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/v1/conversations/91/");
  });

  it("list() returns a PageIterator", async () => {
    global.fetch = mockFetch(200, {
      data: [{ id: 91, external_user_id: "user_12345" }],
    });
    const page = await client.conversations.list();
    expect(page.data).toHaveLength(1);
  });

  it("list() passes query params", async () => {
    global.fetch = mockFetch(200, { data: [] });
    await client.conversations.list({ agent_id: 7, external_user_id: "user_12345" });
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("agent_id=7");
    expect(url).toContain("external_user_id=user_12345");
  });

  it("delete() calls DELETE and returns void", async () => {
    global.fetch = mockFetch(204, undefined);
    await expect(client.conversations.delete(91)).resolves.toBeUndefined();
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("DELETE");
  });
});
