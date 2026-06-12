import { ChatATPClient } from "../src/client.js";
import { mockFetch, mockAgent } from "./fixtures.js";

describe("AgentsResource", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    client = new ChatATPClient({ apiKey: "chatatp_sk_test" });
    global.fetch = mockFetch(200, { data: [mockAgent] });
  });

  it("list() returns a PageIterator with agent data", async () => {
    const page = await client.agents.list();
    expect(page.data).toHaveLength(1);
    expect(page.data[0].id).toBe(7);
    expect(page.data[0].name).toBe("Support Agent");
  });

  it("list() can be iterated with for-await", async () => {
    const page = await client.agents.list();
    const items: typeof mockAgent[] = [];
    for await (const agent of page) items.push(agent);
    expect(items).toHaveLength(1);
  });

  it("list() toArray() collects all items", async () => {
    const page = await client.agents.list();
    const arr = await page.toArray();
    expect(arr).toHaveLength(1);
  });

  it("retrieve() fetches a single agent", async () => {
    global.fetch = mockFetch(200, mockAgent);
    const agent = await client.agents.retrieve(7);
    expect(agent.id).toBe(7);
  });

  it("retrieve() calls the correct endpoint", async () => {
    global.fetch = mockFetch(200, mockAgent);
    await client.agents.retrieve(7);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("/v1/agents/7/");
  });
});
