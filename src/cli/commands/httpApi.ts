/** `studio http-api` -- HTTP API tools and connections. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const TOOL_COLUMNS = ["id", "slug", "name", "category", "method", "endpoint", "auth_type", "is_connected"];
const CONNECTION_COLUMNS = ["id", "tool_slug", "tool_name", "label", "enabled", "has_credentials", "last_error"];

export const httpApi = new Command("http-api").description("HTTP API tools and connections.");

const tools = buildCrudCommand("tools", (ctx) => ctx.httpApi.tools, { columns: TOOL_COLUMNS });
const connections = buildCrudCommand("connections", (ctx) => ctx.httpApi.connections, { columns: CONNECTION_COLUMNS });

httpApi.addCommand(tools);
httpApi.addCommand(connections);

connections
  .command("execute")
  .description("Execute an HTTP API tool connection.")
  .argument("<connection_id>")
  .option("--data <json>", "JSON body with variables/params/body, or @path/to/file.json.")
  .action(
    withErrorHandling(async (connectionId, opts) => {
      const ctx = ctxFrom(httpApi);
      const payload = ui.parseJsonOption(opts.data) || {};
      const spin = ui.spinner("Executing...");
      const result = await ctx.httpApi.execute(connectionId, payload);
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

connections
  .command("oauth-initiate")
  .description("Start the OAuth flow for an HTTP API connection and print the authorize URL.")
  .argument("<connection_id>")
  .action(
    withErrorHandling(async (connectionId) => {
      const ctx = ctxFrom(httpApi);
      const spin = ui.spinner("Starting OAuth flow...");
      const result = await ctx.httpApi.oauthInitiate(connectionId);
      spin.stop();
      if (result?.authorization_url) ui.printInfo(`Open this URL to authorize: ${result.authorization_url}`);
      ui.render(result, ctx.outputFormat);
    })
  );
