/**
 * Shared CLI context: config, API client, and lazily-constructed services.
 *
 * Commander doesn't thread a context object through subcommands the way
 * click does, so `getContext()` builds (and memoizes) a single context per
 * process invocation, using the root program's global options.
 */
import { APIClient } from "./apiClient";
import { Config } from "./config";
import { AgentsService } from "./services/agentsService";
import { AssistantService } from "./services/assistantService";
import { AuthService } from "./services/authService";
import { HttpApiService } from "./services/httpApiService";
import { KnowledgeBaseService } from "./services/kbService";
import { LLMService } from "./services/llmService";
import { MCPService } from "./services/mcpService";
import { PlatformsService } from "./services/platformsService";
import { TeamsService } from "./services/teamsService";
import { UsersService } from "./services/usersService";

export class CLIContext {
  config: Config;
  client: APIClient;
  outputFormat: "table" | "json";

  auth: AuthService;
  users: UsersService;
  teams: TeamsService;
  agents: AgentsService;
  assistant: AssistantService;
  mcp: MCPService;
  httpApi: HttpApiService;
  llm: LLMService;
  kb: KnowledgeBaseService;
  platforms: PlatformsService;

  constructor(config: Config) {
    this.config = config;
    this.client = new APIClient(config);
    this.outputFormat = config.output_format;

    this.auth = new AuthService(this.client);
    this.users = new UsersService(this.client);
    this.teams = new TeamsService(this.client);
    this.agents = new AgentsService(this.client);
    this.assistant = new AssistantService(this.client);
    this.mcp = new MCPService(this.client);
    this.httpApi = new HttpApiService(this.client);
    this.llm = new LLMService(this.client);
    this.kb = new KnowledgeBaseService(this.client);
    this.platforms = new PlatformsService(this.client);
  }
}

let cached: CLIContext | null = null;

export interface GlobalOptions {
  json?: boolean;
  apiUrl?: string;
}

export function getContext(globalOptions: GlobalOptions = {}): CLIContext {
  if (cached) return cached;
  const config = Config.load();
  if (globalOptions.apiUrl) config.api_url = globalOptions.apiUrl;
  if (globalOptions.json) config.output_format = "json";
  cached = new CLIContext(config);
  return cached;
}

/** Test-only hook to force a fresh context on the next getContext() call. */
export function resetContext(): void {
  cached = null;
}
