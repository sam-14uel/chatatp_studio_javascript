/** `studio agents` -- agent CRUD and preview chat. */
import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const COLUMNS = ["id", "name", "status", "description", "team_id", "updated_at"];

export const agents = buildCrudCommand("agents", (ctx) => ctx.agents, { columns: COLUMNS });

agents
  .command("preview")
  .description("Send a one-off preview message to an agent and print the reply.")
  .argument("<agent_id>")
  .requiredOption("-m, --message <message>", "Message to send to the agent.")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(agents);
      const spin = ui.spinner("Waiting for agent reply...");
      const result = await ctx.agents.preview(agentId, opts.message);
      spin.stop();
      if (result && typeof result === "object" && "reply" in result) {
        const reply = result.reply;
        const content = reply && typeof reply === "object" ? reply.content : reply;
        ui.printPanel("Agent reply", String(content));
        if (result.tool_calls?.length) {
          ui.render(result.tool_calls, ctx.outputFormat, undefined, "Tool calls");
        }
      } else {
        ui.render(result, ctx.outputFormat);
      }
    })
  );
