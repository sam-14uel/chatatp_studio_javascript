/** `studio config` -- inspect and edit the local CLI configuration. */
import { Command } from "commander";

import { Config } from "../config";
import { ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const SENSITIVE = new Set(["access", "refresh", "token"]);

export const config = new Command("config").description("Manage local CLI configuration (~/.studio/config.json).");

config
  .command("show")
  .description("Print the current configuration (secrets are masked).")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(config);
      const data = ctx.config.asObject();
      for (const key of SENSITIVE) {
        if (data[key]) data[key] = ui.maskSecret(data[key] as string);
      }
      ui.render(data, ctx.outputFormat);
    })
  );

config
  .command("get")
  .description("Print a single configuration value.")
  .argument("<key>")
  .action(
    withErrorHandling(async (key) => {
      const ctx = ctxFrom(config);
      let value: any = ctx.config.get(key);
      if (SENSITIVE.has(key) && value) value = ui.maskSecret(value);
      console.log(value);
    })
  );

config
  .command("set")
  .description("Set a configuration value, e.g. `studio config set api_url https://...`.")
  .argument("<key>")
  .argument("<value>")
  .action(
    withErrorHandling(async (key, value) => {
      const ctx = ctxFrom(config);
      ctx.config.set(key, value);
      ctx.config.save();
      ui.printSuccess(`${key} updated.`);
    })
  );

config
  .command("path")
  .description("Print the path to the local config file.")
  .action(() => {
    console.log(Config.configPath());
  });
