/** Messaging platform catalog and configs service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class PlatformsService {
  configs: BaseService;

  constructor(private client: APIClient) {
    this.configs = new BaseService(client, endpoints.PLATFORM_CONFIGS, endpoints.PLATFORM_CONFIG_DETAIL);
  }

  listCatalog() {
    return this.client.get(endpoints.PLATFORM_CATALOG);
  }

  getCatalogEntry(id: string | number) {
    return this.client.get(endpoints.PLATFORM_CATALOG_DETAIL(id));
  }

  connect(platform: string | number, credentials: Record<string, unknown>) {
    return this.client.post(endpoints.PLATFORM_CONNECT, { platform, credentials });
  }

  disconnect(platform: string | number) {
    return this.client.post(endpoints.PLATFORM_DISCONNECT, { platform });
  }
}
