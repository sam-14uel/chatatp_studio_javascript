import { Requester } from "../utils/requester.js";
import type { Usage } from "../types/index.js";

export class UsageResource {
  constructor(private readonly requester: Requester) {}

  /** Retrieve usage statistics for the current API key */
  async retrieve(): Promise<Usage> {
    return this.requester.request<Usage>("GET", "/v1/usage/");
  }
}
