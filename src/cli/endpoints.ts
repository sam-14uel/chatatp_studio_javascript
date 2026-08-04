/**
 * Central registry of Studio backend API paths.
 *
 * Every path used by the CLI is declared here, in one place, so the
 * implementation can be corrected or extended without hunting through
 * services and commands.
 *
 * Paths marked "(documented)" are taken verbatim from the generated
 * ChatATP Studio API reference. Paths marked "(inferred)" were not
 * individually enumerated in the reference -- only the base path and the
 * response schema were documented -- and are inferred by following the
 * same REST conventions used by the fully-documented resources (teams,
 * users, platforms, knowledge bases): a collection endpoint at the base
 * path, and a detail endpoint at `<base>/<id>/` supporting
 * GET/PATCH/DELETE. If your backend uses different paths for these,
 * adjust them here; nothing else in the codebase needs to change.
 */

// ---------------------------------------------------------------------------
// Auth & users                                                 (documented)
// ---------------------------------------------------------------------------
export const AUTH_SIGNUP = "/dapi/auth/signup/";
export const AUTH_SIGNIN = "/dapi/auth/signin/";
export const AUTH_FORGOT_PASSWORD = "/dapi/auth/forgot-password/";
export const AUTH_RESET_PASSWORD = "/dapi/auth/reset-password/";
export const AUTH_SIGNOUT = "/dapi/auth/signout/";
export const AUTH_ME = "/dapi/auth/me/";
export const AUTH_PROFILE = "/dapi/auth/profile/";
export const AUTH_ONBOARDING = "/dapi/auth/onboarding/";
export const AUTH_TOKEN_REFRESH = "/dapi/auth/token/refresh/";
export const AUTH_OAUTH_PROVIDERS = "/dapi/auth/oauth/providers/";
export const AUTH_OAUTH_START = (provider: string) => `/dapi/auth/oauth/${provider}/start/`;
export const AUTH_OAUTH_CALLBACK = (provider: string) => `/dapi/auth/oauth/${provider}/callback/`;

export const USERS = "/dapi/users/";
export const USER_DETAIL = (id: string | number) => `/dapi/users/${id}/`;
export const USER_INVITATIONS = "/dapi/users/invitations/";
export const USER_INVITATION_ACCEPT = (token: string) => `/dapi/users/invitations/${token}/accept/`;
export const USER_INVITATION_DECLINE = (token: string) => `/dapi/users/invitations/${token}/decline/`;

// ---------------------------------------------------------------------------
// Teams                                                        (documented)
// ---------------------------------------------------------------------------
export const TEAMS = "/dapi/teams/";
export const TEAM_DETAIL = (id: string | number) => `/dapi/teams/${id}/`;
export const TEAM_MEMBERS = (id: string | number) => `/dapi/teams/${id}/members/`;
export const TEAM_MEMBER_DETAIL = (id: string | number, userId: string | number) =>
  `/dapi/teams/${id}/members/${userId}/`;
export const TEAM_INVITATIONS = (id: string | number) => `/dapi/teams/${id}/invitations/`;
export const TEAM_INVITATION_ACCEPT = (token: string) => `/dapi/teams/invitations/${token}/accept/`;
export const TEAM_INVITATION_DECLINE = (token: string) => `/dapi/teams/invitations/${token}/decline/`;

// ---------------------------------------------------------------------------
// Platforms                                                    (documented)
// ---------------------------------------------------------------------------
export const PLATFORM_CATALOG = "/dapi/platforms/catalog/";
export const PLATFORM_CATALOG_DETAIL = (id: string | number) => `/dapi/platforms/catalog/${id}/`;
export const PLATFORM_CONFIGS = "/dapi/platforms/configs/";
export const PLATFORM_CONFIG_DETAIL = (id: string | number) => `/dapi/platforms/configs/${id}/`;
export const PLATFORM_CONNECT = "/dapi/platforms/connect/";
export const PLATFORM_DISCONNECT = "/dapi/platforms/disconnect/";

// ---------------------------------------------------------------------------
// Knowledge bases                                              (documented)
// ---------------------------------------------------------------------------
export const KB_LIST = "/dapi/knowledge-bases/";
export const KB_DETAIL = (id: string) => `/dapi/knowledge-bases/${id}/`;
export const KB_DOCUMENTS = (id: string) => `/dapi/knowledge-bases/${id}/documents/`;
export const KB_DOCUMENT_DETAIL = (id: string, docId: string) => `/dapi/knowledge-bases/${id}/documents/${docId}/`;
export const KB_DOCUMENT_CHUNKS = (id: string, docId: string) =>
  `/dapi/knowledge-bases/${id}/documents/${docId}/chunks/`;
export const KB_DOMAINS = (id: string) => `/dapi/knowledge-bases/${id}/domains/`;
export const KB_DOMAIN_DETAIL = (id: string, domainId: string) => `/dapi/knowledge-bases/${id}/domains/${domainId}/`;
export const KB_DOMAIN_CRAWL = (id: string, domainId: string) =>
  `/dapi/knowledge-bases/${id}/domains/${domainId}/crawl/`;
export const KB_STATS = (id: string) => `/dapi/knowledge-bases/${id}/stats/`;
export const KB_SEARCH = (id: string) => `/dapi/knowledge-bases/${id}/search/`;

export const AGENT_KB_STATS = (agentId: string | number) => `/dapi/agents/${agentId}/kb/stats/`;
export const AGENT_KB_DOCUMENTS = (agentId: string | number) => `/dapi/agents/${agentId}/kb/documents/`;
export const AGENT_KB_DOCUMENT_DETAIL = (agentId: string | number, docId: string) =>
  `/dapi/agents/${agentId}/kb/documents/${docId}/`;
export const AGENT_KB_DOCUMENT_CHUNKS = (agentId: string | number, docId: string) =>
  `/dapi/agents/${agentId}/kb/documents/${docId}/chunks/`;
export const AGENT_KB_DOMAINS = (agentId: string | number) => `/dapi/agents/${agentId}/kb/domains/`;
export const AGENT_KB_DOMAIN_DETAIL = (agentId: string | number, domainId: string) =>
  `/dapi/agents/${agentId}/kb/domains/${domainId}/`;
export const AGENT_KB_DOMAIN_CRAWL = (agentId: string | number, domainId: string) =>
  `/dapi/agents/${agentId}/kb/domains/${domainId}/crawl/`;
export const AGENT_KB_SEARCH = (agentId: string | number) => `/dapi/agents/${agentId}/kb/search/`;
export const AGENT_KB_TEST = (agentId: string | number) => `/dapi/agents/${agentId}/kb/test/`;

export const AGENT_KB_ATTACHMENTS = (agentId: string | number) => `/dapi/agents/${agentId}/knowledge-bases/`;
export const AGENT_KB_ATTACHMENT_DETAIL = (agentId: string | number, attachmentId: string) =>
  `/dapi/agents/${agentId}/knowledge-bases/${attachmentId}/`;
export const AGENT_KB_AVAILABLE = (agentId: string | number) => `/dapi/agents/${agentId}/knowledge-bases/available/`;

// ---------------------------------------------------------------------------
// Assistant / Copilot                                          (documented)
// ---------------------------------------------------------------------------
export const ASSISTANT_CHAT = "/dapi/assistant/chat/";
export const ASSISTANT_CHAT_STREAM = "/dapi/assistant/chat/stream/";
export const ASSISTANT_CONFIG = "/dapi/assistant/config/";
export const ASSISTANT_SESSIONS = "/dapi/assistant/sessions/";
export const ASSISTANT_SESSION_CREATE = "/dapi/assistant/sessions/create/";
export const ASSISTANT_SESSION_DETAIL = (id: string) => `/dapi/assistant/sessions/${id}/`;
export const ASSISTANT_SESSION_STATE = (id: string) => `/dapi/assistant/sessions/${id}/state/`;
export const ASSISTANT_SESSION_STOP = (id: string) => `/dapi/assistant/sessions/${id}/stop/`;
export const ASSISTANT_SESSION_RETRY = (id: string) => `/dapi/assistant/sessions/${id}/retry/`;
export const ASSISTANT_SESSION_EVENTS = (id: string) => `/dapi/assistant/sessions/${id}/events/`;
export const ASSISTANT_SESSION_EVENT_DETAIL = (id: string, eventId: number) =>
  `/dapi/assistant/sessions/${id}/events/${eventId}/`;
export const ASSISTANT_SESSION_EVENT_REGENERATE = (id: string, eventId: number) =>
  `/dapi/assistant/sessions/${id}/events/${eventId}/regenerate/`;
export const ASSISTANT_SESSION_EVENT_FEEDBACK = (id: string, eventId: number) =>
  `/dapi/assistant/sessions/${id}/events/${eventId}/feedback/`;
export const ASSISTANT_ANALYTICS = "/dapi/assistant/analytics/";

// ---------------------------------------------------------------------------
// Agents                                                        (inferred)
// ---------------------------------------------------------------------------
export const AGENTS = "/dapi/agents/";
export const AGENT_DETAIL = (id: string | number) => `/dapi/agents/${id}/`;
export const AGENT_PREVIEW = (id: string | number) => `/dapi/agents/${id}/preview/`;

// ---------------------------------------------------------------------------
// MCP                                                           (inferred)
// ---------------------------------------------------------------------------
export const MCP_SERVERS = "/dapi/mcp/servers/";
export const MCP_SERVER_DETAIL = (id: string | number) => `/dapi/mcp/servers/${id}/`;
export const MCP_CONNECTIONS = "/dapi/mcp/connections/";
export const MCP_CONNECTION_DETAIL = (id: string | number) => `/dapi/mcp/connections/${id}/`;
export const MCP_OAUTH_INITIATE = (id: string | number) => `/dapi/mcp/connections/${id}/oauth/initiate/`;

// ---------------------------------------------------------------------------
// HTTP API tools                                                (inferred)
// ---------------------------------------------------------------------------
export const HTTP_API_TOOLS = "/dapi/http-api/tools/";
export const HTTP_API_TOOL_DETAIL = (id: string | number) => `/dapi/http-api/tools/${id}/`;
export const HTTP_API_CONNECTIONS = "/dapi/http-api/connections/";
export const HTTP_API_CONNECTION_DETAIL = (id: string | number) => `/dapi/http-api/connections/${id}/`;
export const HTTP_API_CONNECTION_EXECUTE = (id: string | number) => `/dapi/http-api/connections/${id}/execute/`;
export const HTTP_API_OAUTH_INITIATE = (id: string | number) => `/dapi/http-api/connections/${id}/oauth/initiate/`;

// ---------------------------------------------------------------------------
// LLM providers                                                 (inferred)
// ---------------------------------------------------------------------------
export const LLM_PROVIDERS = "/dapi/llm/providers/";
export const LLM_PROVIDER_DETAIL = (id: string | number) => `/dapi/llm/providers/${id}/`;
export const LLM_PROVIDER_MODELS = (id: string | number) => `/dapi/llm/providers/${id}/models/`;
export const LLM_PROVIDER_CONFIGS = "/dapi/llm/configs/";
export const LLM_PROVIDER_CONFIG_DETAIL = (id: string | number) => `/dapi/llm/configs/${id}/`;
