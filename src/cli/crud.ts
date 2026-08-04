/**
 * Generic CRUD command factory shared by every resource command module.
 *
 * `buildCrudCommand` produces a commander `Command` with `list`, `get`,
 * `create`, `update`, and `delete` subcommands wired to a `BaseService`-
 * shaped object (anything with .list/.get/.create/.update/.delete).
 * Resource-specific command modules use this for the boilerplate CRUD
 * surface and then add bespoke subcommands (connect, preview, execute,
 * search, ...) alongside it.
 */
import { Command } from "commander";

import { CLIContext, getContext, GlobalOptions } from "./context";
import { APIError, AuthenticationError, StudioError } from "./errors";
import * as ui from "./ui";

export function withErrorHandling<T extends (...args: any[]) => Promise<void>>(fn: T): T {
  const wrapped = async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (err) {
      if (err instanceof AuthenticationError || err instanceof APIError || err instanceof StudioError) {
        ui.printError(err.message);
        process.exitCode = 1;
        return;
      }
      throw err;
    }
  };
  return wrapped as T;
}

/** Read the root program's global options (--json, --api-url) from any subcommand. */
export function rootOptions(cmd: Command): GlobalOptions {
  let node: Command = cmd;
  while (node.parent) node = node.parent;
  const opts = node.opts();
  return { json: Boolean(opts.json), apiUrl: opts.apiUrl };
}

export function ctxFrom(cmd: Command): CLIContext {
  return getContext(rootOptions(cmd));
}

export interface CrudOptions {
  columns?: string[];
  idLabel?: string;
  supportsCreate?: boolean;
  supportsUpdate?: boolean;
  supportsDelete?: boolean;
}

export function buildCrudCommand(
  name: string,
  serviceGetter: (ctx: CLIContext) => any,
  options: CrudOptions = {}
): Command {
  const {
    columns,
    idLabel = "id",
    supportsCreate = true,
    supportsUpdate = true,
    supportsDelete = true,
  } = options;

  const group = new Command(name).description(`Manage ${name}.`);

  group
    .command("list")
    .description(`List ${name}.`)
    .option("--page <n>", "Page number, if the API paginates results.")
    .option("--page-size <n>", "Page size, if supported by the API.")
    .option("--filter <keyvalue...>", "Extra query filter as key=value. Repeatable.")
    .action(
      withErrorHandling(async (opts) => {
        const ctx = ctxFrom(group);
        const params: Record<string, unknown> = opts.filter ? ui.keyValuePairsToDict(opts.filter) : {};
        if (opts.page) params.page = opts.page;
        if (opts.pageSize) params.page_size = opts.pageSize;
        const spin = ui.spinner(`Fetching ${name}...`);
        try {
          const data = await serviceGetter(ctx).list(params);
          spin.stop();
          ui.render(data, ctx.outputFormat, columns, name);
        } catch (err) {
          spin.stop();
          throw err;
        }
      })
    );

  group
    .command("get")
    .description(`Retrieve a single resource from ${name} by ${idLabel}.`)
    .argument(`<${idLabel}>`)
    .action(
      withErrorHandling(async (id) => {
        const ctx = ctxFrom(group);
        const spin = ui.spinner("Fetching...");
        try {
          const data = await serviceGetter(ctx).get(id);
          spin.stop();
          ui.render(data, ctx.outputFormat, columns);
        } catch (err) {
          spin.stop();
          throw err;
        }
      })
    );

  if (supportsCreate) {
    group
      .command("create")
      .description(`Create a new resource in ${name}.`)
      .requiredOption("--data <json>", "JSON payload, or @path/to/file.json.")
      .action(
        withErrorHandling(async (opts) => {
          const ctx = ctxFrom(group);
          const payload = ui.parseJsonOption(opts.data) || {};
          const spin = ui.spinner("Creating...");
          try {
            const result = await serviceGetter(ctx).create(payload);
            spin.stop();
            ui.printSuccess("Created.");
            ui.render(result, ctx.outputFormat, columns);
          } catch (err) {
            spin.stop();
            throw err;
          }
        })
      );
  }

  if (supportsUpdate) {
    group
      .command("update")
      .description(`Update an existing resource in ${name}.`)
      .argument(`<${idLabel}>`)
      .requiredOption("--data <json>", "JSON payload (partial), or @path/to/file.json.")
      .option("--full", "Send a full PUT replace instead of a partial PATCH.", false)
      .action(
        withErrorHandling(async (id, opts) => {
          const ctx = ctxFrom(group);
          const payload = ui.parseJsonOption(opts.data) || {};
          const spin = ui.spinner("Updating...");
          try {
            const result = await serviceGetter(ctx).update(id, payload, !opts.full);
            spin.stop();
            ui.printSuccess("Updated.");
            ui.render(result, ctx.outputFormat, columns);
          } catch (err) {
            spin.stop();
            throw err;
          }
        })
      );
  }

  if (supportsDelete) {
    group
      .command("delete")
      .description(`Delete a resource from ${name}.`)
      .argument(`<${idLabel}>`)
      .option("-y, --yes", "Skip the confirmation prompt.", false)
      .action(
        withErrorHandling(async (id, opts) => {
          const ctx = ctxFrom(group);
          if (!opts.yes && !(await ui.confirm(`Delete ${name} ${id}?`))) {
            ui.printInfo("Cancelled.");
            return;
          }
          const spin = ui.spinner("Deleting...");
          try {
            await serviceGetter(ctx).delete(id);
            spin.stop();
            ui.printSuccess("Deleted.");
          } catch (err) {
            spin.stop();
            throw err;
          }
        })
      );
  }

  return group;
}
