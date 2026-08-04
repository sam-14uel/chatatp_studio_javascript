/** `studio llm` -- LLM providers and provider configs. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const PROVIDER_COLUMNS = ["id", "slug", "name", "base_url", "available_models"];
const CONFIG_COLUMNS = ["id", "provider_slug", "provider_name", "label", "is_default", "api_key_masked"];

export const llm = new Command("llm").description("LLM providers and API-key configurations.");

const providers = buildCrudCommand("providers", (ctx) => ctx.llm.providers, {
  columns: PROVIDER_COLUMNS,
  supportsCreate: false,
  supportsUpdate: false,
  supportsDelete: false,
});
const configs = buildCrudCommand("configs", (ctx) => ctx.llm.configs, { columns: CONFIG_COLUMNS });

llm.addCommand(providers);
llm.addCommand(configs);

providers
  .command("models")
  .description("List available models for a provider.")
  .argument("<provider_id>")
  .action(
    withErrorHandling(async (providerId) => {
      const ctx = ctxFrom(llm);
      const spin = ui.spinner("Fetching models...");
      const result = await ctx.llm.providerModels(providerId);
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );
