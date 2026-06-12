import { ChatATPClient } from "../src/client.js";
import {
  AuthenticationError,
  PermissionError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  ServerError,
} from "../src/errors/index.js";
import { mockFetch } from "./fixtures.js";

describe("Error handling", () => {
  let client: ChatATPClient;

  beforeEach(() => {
    client = new ChatATPClient({ apiKey: "chatatp_sk_test" });
  });

  it("throws AuthenticationError on 401", async () => {
    global.fetch = mockFetch(401, { detail: "Invalid or revoked API key." });
    await expect(client.agents.list()).rejects.toThrow(AuthenticationError);
  });

  it("throws PermissionError on 403", async () => {
    global.fetch = mockFetch(403, { detail: "Forbidden." });
    await expect(client.agents.list()).rejects.toThrow(PermissionError);
  });

  it("throws ValidationError on 400", async () => {
    global.fetch = mockFetch(400, { content: ["This field may not be blank."] });
    await expect(client.messages.send(91, { content: "" })).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError on 404", async () => {
    global.fetch = mockFetch(404, { detail: "Not found." });
    await expect(client.agents.retrieve(999)).rejects.toThrow(NotFoundError);
  });

  it("throws RateLimitError on 429", async () => {
    global.fetch = mockFetch(429, { detail: "Rate limit exceeded." });
    await expect(client.agents.list()).rejects.toThrow(RateLimitError);
  });

  it("throws ServerError on 500", async () => {
    global.fetch = mockFetch(500, { detail: "Internal server error." });
    await expect(client.agents.list()).rejects.toThrow(ServerError);
  });

  it("error exposes statusCode and payload", async () => {
    global.fetch = mockFetch(404, { detail: "Agent not found." });
    try {
      await client.agents.retrieve(999);
      fail("Should have thrown");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect((err as NotFoundError).statusCode).toBe(404);
      expect((err as NotFoundError).payload).toEqual({ detail: "Agent not found." });
    }
  });

  it("throws on missing apiKey", () => {
    expect(() => new ChatATPClient({ apiKey: "" })).toThrow("apiKey is required");
  });
});
