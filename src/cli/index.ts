#!/usr/bin/env node
/** Entry point for the `studio` executable. */
import { Command } from "commander";

import { agents } from "./commands/agents";
import { assistant } from "./commands/assistant";
import { auth } from "./commands/auth";
import { config } from "./commands/config";
import { httpApi } from "./commands/httpApi";
import { kb } from "./commands/kb";
import { llm } from "./commands/llm";
import { mcp } from "./commands/mcp";
import { platforms } from "./commands/platforms";
import { teams } from "./commands/teams";
import { users } from "./commands/users";

import fs from "fs";
import path from "path";

const pkgPath = [
  path.resolve(__dirname, "..", "..", "..", "package.json"),
  path.resolve(__dirname, "..", "..", "package.json"),
].find((candidate) => fs.existsSync(candidate));

const pkg = pkgPath ? require(pkgPath) : { version: "0.0.0" };

const program = new Command();

program
  .name("studio")
  .description(
    "studio -- official ChatATP Studio command-line interface.\n\n" +
      "Run `studio auth login` to authenticate, then explore resources with\n" +
      "`studio <resource> --help`, e.g. `studio agents --help`."
  )
  .version(pkg.version, "--version", "Show the version and exit.")
  .option("--json", "Output raw JSON instead of tables.")
  .option("--api-url <url>", "Override the configured Studio API base URL for this invocation.");

program.addCommand(auth);
program.addCommand(config);
program.addCommand(users);
program.addCommand(teams);
program.addCommand(agents);
program.addCommand(assistant);
program.addCommand(mcp);
program.addCommand(httpApi);
program.addCommand(llm);
program.addCommand(kb);
program.addCommand(platforms);

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
