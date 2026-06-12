import { ChatATPClient } from "../src/client.js";
import { mockAgent } from "./fixtures.js";

describe("Retry logic", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    // Use a client with immediate retries and no jitter for test speed
    client = new ChatATPClient({ apiKey: "chatatp_sk_test", maxRetries: 2 });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retries on 500 and succeeds on the next attempt", async () => {
    let calls = 0;
    global.fetch = jest.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) {
        return { ok: false, status: 500, headers: { get: () => null }, json: async () => ({ detail: "error" }) };
      }
      return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ data: [mockAgent] }) };
    });

    // Advance all timers while the request is in flight
    const promise = client.agents.list();
    await jest.runAllTimersAsync();
    const page = await promise;

    expect(calls).toBe(2);
    expect(page.data).toHaveLength(1);
  });
});
