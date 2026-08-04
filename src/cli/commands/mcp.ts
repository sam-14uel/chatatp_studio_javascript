/** `studio mcp` -- MCP servers and connections. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const SERVER_COLUMNS = ["id", "slug", "name", "category", "transport_type", "auth_type", "is_connected"];
const CONNECTION_COLUMNS = ["id", "server_slug", "server_name", "label", "enabled", "has_credentials", "last_error"];

export const mcp = new Command("mcp").description("MCP servers and connections.");

const servers = buildCrudCommand("servers", (ctx) => ctx.mcp.servers, { columns: SERVER_COLUMNS });
const connections = buildCrudCommand("connections", (ctx) => ctx.mcp.connections, { columns: CONNECTION_COLUMNS });

mcp.addCommand(servers);
mcp.addCommand(connections);

connections
  .command("oauth-initiate")
  .description("Start the OAuth flow for an MCP connection and print the authorize URL.")
  .argument("<connection_id>")
  .action(
    withErrorHandling(async (connectionId) => {
      const ctx = ctxFrom(mcp);
      const spin = ui.spinner("Starting OAuth flow...");
      const result = await ctx.mcp.oauthInitiate(connectionId);
      spin.stop();
      if (result?.authorization_url) ui.printInfo(`Open this URL to authorize: ${result.authorization_url}`);
      ui.render(result, ctx.outputFormat);
    })
  );
