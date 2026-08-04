/** LLM providers and provider-config service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class LLMService {
  providers: BaseService;
  configs: BaseService;

  constructor(private client: APIClient) {
    this.providers = new BaseService(client, endpoints.LLM_PROVIDERS, endpoints.LLM_PROVIDER_DETAIL);
    this.configs = new BaseService(client, endpoints.LLM_PROVIDER_CONFIGS, endpoints.LLM_PROVIDER_CONFIG_DETAIL);
  }

  providerModels(providerId: string | number) {
    return this.client.get(endpoints.LLM_PROVIDER_MODELS(providerId));
  }
}
