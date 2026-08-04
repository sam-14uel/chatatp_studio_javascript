/** HTTP API tools and connections service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class HttpApiService {
  tools: BaseService;
  connections: BaseService;

  constructor(private client: APIClient) {
    this.tools = new BaseService(client, endpoints.HTTP_API_TOOLS, endpoints.HTTP_API_TOOL_DETAIL);
    this.connections = new BaseService(client, endpoints.HTTP_API_CONNECTIONS, endpoints.HTTP_API_CONNECTION_DETAIL);
  }

  execute(connectionId: string | number, body: Record<string, unknown> = {}) {
    return this.client.post(endpoints.HTTP_API_CONNECTION_EXECUTE(connectionId), body);
  }

  oauthInitiate(connectionId: string | number) {
    return this.client.post(endpoints.HTTP_API_OAUTH_INITIATE(connectionId));
  }
}
