/** Agents service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class AgentsService extends BaseService {
  constructor(client: APIClient) {
    super(client, endpoints.AGENTS, endpoints.AGENT_DETAIL);
  }

  preview(agentId: string | number, message: string) {
    return this.client.post(endpoints.AGENT_PREVIEW(agentId), { message });
  }
}
