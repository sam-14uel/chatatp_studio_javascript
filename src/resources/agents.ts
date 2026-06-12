import { Requester } from "../utils/requester.js";
import { PageIterator } from "../utils/paginator.js";
import type { Agent, Page } from "../types/index.js";

export class AgentsResource {
  constructor(private readonly requester: Requester) {}

  /** List all agents accessible to the current API key */
  async list(): Promise<PageIterator<Agent>> {
    const res = await this.requester.request<Page<Agent>>("GET", "/v1/agents/");
    return new PageIterator(res.data);
  }

  /** Retrieve a single agent by ID */
  async retrieve(agentId: number): Promise<Agent> {
    return this.requester.request<Agent>("GET", `/v1/agents/${agentId}/`);
  }
}
