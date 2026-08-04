/** `studio platforms` -- messaging platform catalog and configs. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const CONFIG_COLUMNS = ["id", "platform_slug", "platform_name", "label", "status", "created_at"];

export const platforms = new Command("platforms").description("Messaging platform catalog and connected configs.");

const catalog = new Command("catalog").description("Browse the platform catalog (Discord, Slack, WhatsApp, ...).");
platforms.addCommand(catalog);

catalog
  .command("list")
  .description("List all available platforms.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(platforms);
      const spin = ui.spinner("Fetching catalog...");
      const data = await ctx.platforms.listCatalog();
      spin.stop();
      ui.render(data, ctx.outputFormat, ["id", "slug", "name", "type", "is_connected"]);
    })
  );

catalog
  .command("get")
  .description("Get a single platform catalog entry.")
  .argument("<platform_id>")
  .action(
    withErrorHandling(async (platformId) => {
      const ctx = ctxFrom(platforms);
      const spin = ui.spinner("Fetching platform...");
      const data = await ctx.platforms.getCatalogEntry(platformId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

const configs = buildCrudCommand("configs", (ctx) => ctx.platforms.configs, { columns: CONFIG_COLUMNS });
platforms.addCommand(configs);

platforms
  .command("connect")
  .description("Connect a messaging platform with credentials.")
  .requiredOption("--platform <platform_id>", "Platform id from the catalog.")
  .requiredOption("--credentials <json>", "JSON credentials payload, or @path/to/file.json.")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(platforms);
      const creds = ui.parseJsonOption(opts.credentials) || {};
      const spin = ui.spinner("Connecting...");
      const result = await ctx.platforms.connect(opts.platform, creds);
      spin.stop();
      ui.printSuccess("Platform connected.");
      ui.render(result, ctx.outputFormat);
    })
  );

platforms
  .command("disconnect")
  .description("Disconnect a messaging platform.")
  .requiredOption("--platform <platform_id>", "Platform id from the catalog.")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(platforms);
      if (!opts.yes && !(await ui.confirm(`Disconnect platform ${opts.platform}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Disconnecting...");
      await ctx.platforms.disconnect(opts.platform);
      spin.stop();
      ui.printSuccess("Platform disconnected.");
    })
  );
