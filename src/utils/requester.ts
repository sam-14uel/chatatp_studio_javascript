import { buildApiError, NetworkError, TimeoutError } from "../errors/index.js";

const DEFAULT_BASE_URL = "https://chatatp-agent-builder-backend.onrender.com";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_INITIAL_DELAY_MS = 500;

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export interface RequesterOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}

export class Requester {
  private readonly apiKey: string;
  readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly debug: boolean;

  constructor(options: RequesterOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.debug = options.debug ?? false;
  }

  private log(...args: unknown[]) {
    if (this.debug) console.debug("[chatatp]", ...args);
  }

  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async request<T>(
    method: string,
    path: string,
    options: { body?: unknown; query?: Record<string, string | number | undefined> } = {}
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (options.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    let attempt = 0;
    while (true) {
      this.log(`→ ${method} ${url.toString()}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const res = await fetch(url.toString(), {
          method,
          headers: this.authHeaders(),
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        const requestId = res.headers.get("x-request-id") ?? undefined;
        this.log(`← ${res.status}`, requestId ? `(${requestId})` : "");

        if (res.status === 204) return undefined as T;

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const err = buildApiError(res.status, json as Record<string, unknown>, requestId);
          if (RETRYABLE_STATUS_CODES.has(res.status) && attempt < this.maxRetries) {
            const delay = RETRY_INITIAL_DELAY_MS * 2 ** attempt;
            this.log(`retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
            await sleep(delay);
            attempt++;
            continue;
          }
          throw err;
        }

        return json as T;
      } catch (err: unknown) {
        clearTimeout(timer);
        if (err instanceof Error && err.name === "AbortError") {
          throw new TimeoutError(`Request to ${url.toString()} timed out after ${this.timeout}ms`);
        }
        if (isChatATPError(err)) throw err;
        if (attempt < this.maxRetries) {
          const delay = RETRY_INITIAL_DELAY_MS * 2 ** attempt;
          this.log(`network error, retrying in ${delay}ms`);
          await sleep(delay);
          attempt++;
          continue;
        }
        throw new NetworkError(`Network request failed: ${(err as Error).message}`);
      }
    }
  }

  /** Returns an async generator that yields parsed SSE events */
  async *stream(
    path: string,
    body: unknown
  ): AsyncGenerator<{ type: string; data: unknown }> {
    const url = this.baseUrl + path;
    this.log(`→ POST (stream) ${url}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout * 4); // longer for streams

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { ...this.authHeaders(), Accept: "text/event-stream" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new TimeoutError("Stream connection timed out.");
      }
      throw new NetworkError(`Stream connection failed: ${(err as Error).message}`);
    }

    if (!res.ok) {
      clearTimeout(timer);
      const json = await res.json().catch(() => ({}));
      throw buildApiError(res.status, json as Record<string, unknown>);
    }

    const body2 = res.body;
    if (!body2) { clearTimeout(timer); return; }

    const reader = body2.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const block of events) {
          if (!block.trim()) continue;
          const parsed = parseSseBlock(block);
          if (parsed) {
            this.log(`← event: ${parsed.type}`);
            yield parsed;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new TimeoutError("Stream timed out while reading.");
      }
      throw new NetworkError(`Stream read failed: ${(err as Error).message}`);
    } finally {
      clearTimeout(timer);
      reader.releaseLock();
    }
  }
}

function parseSseBlock(block: string): { type: string; data: unknown } | null {
  const lines = block.split("\n");
  let type = "";
  let dataStr = "";
  for (const line of lines) {
    if (line.startsWith("event:")) type = line.slice(6).trim();
    if (line.startsWith("data:")) dataStr = line.slice(5).trim();
  }
  if (!dataStr) return null;
  try {
    return { type, data: JSON.parse(dataStr) };
  } catch {
    return { type, data: dataStr };
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function isChatATPError(err: unknown): boolean {
  return err instanceof Error && "statusCode" in err;
}
