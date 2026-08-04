/** MCP servers and connections service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class MCPService {
  servers: BaseService;
  connections: BaseService;

  constructor(private client: APIClient) {
    this.servers = new BaseService(client, endpoints.MCP_SERVERS, endpoints.MCP_SERVER_DETAIL);
    this.connections = new BaseService(client, endpoints.MCP_CONNECTIONS, endpoints.MCP_CONNECTION_DETAIL);
  }

  oauthInitiate(connectionId: string | number) {
    return this.client.post(endpoints.MCP_OAUTH_INITIATE(connectionId));
  }
}
