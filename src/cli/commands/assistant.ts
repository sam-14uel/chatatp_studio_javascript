/** `studio assistant` -- Copilot chat, config, sessions, events, analytics. */
import { Command } from "commander";

import * as endpoints from "../endpoints";
import { ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

export const assistant = new Command("assistant").description("AI Copilot: chat, sessions, and configuration.");

async function streamChat(ctx: ReturnType<typeof ctxFrom>, message: string, sessionId?: string): Promise<void> {
  const payload: Record<string, unknown> = { messages: [{ role: "user", content: message }] };
  if (sessionId) payload.session_id = sessionId;

  const resp = await ctx.client.raw.post(endpoints.ASSISTANT_CHAT_STREAM, payload, {
    responseType: "stream",
    headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
  });

  await new Promise<void>((resolve, reject) => {
    let buffer = "";
    resp.data.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf-8");
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice("data:".length).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const event = JSON.parse(data);
          if (event.type === "assistant_text.delta") {
            process.stdout.write(event.delta || "");
          } else if (event.type === "tool_call.started") {
            process.stdout.write("\n");
            ui.printInfo(`Tool call started: ${event.name}`);
          } else if (event.type === "error") {
            process.stdout.write("\n");
            ui.printError(String(event.message || JSON.stringify(event)));
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    });
    resp.data.on("end", () => {
      process.stdout.write("\n");
      resolve();
    });
    resp.data.on("error", reject);
  });
}

assistant
  .command("chat")
  .description("Send a message to the Copilot assistant.")
  .requiredOption("-m, --message <message>", "Message to send.")
  .option("--session <session_id>", "Existing session id to continue.")
  .option("--stream", "Stream the reply via SSE instead of waiting for the full response.", false)
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(assistant);
      if (opts.stream) {
        await streamChat(ctx, opts.message, opts.session);
        return;
      }
      const spin = ui.spinner("Thinking...");
      const result = await ctx.assistant.chat([{ role: "user", content: opts.message }], opts.session);
      spin.stop();
      if (result && typeof result === "object" && "reply" in result) {
        ui.printPanel(`Assistant (${result.model || ""})`, String(result.reply));
        if (result.tool_calls?.length) {
          ui.render(result.tool_calls, ctx.outputFormat, undefined, "Tool calls");
        }
      } else {
        ui.render(result, ctx.outputFormat);
      }
    })
  );

const config = new Command("config").description("Copilot configuration (model, temperature, prompt, ...).");
assistant.addCommand(config);

config
  .command("get")
  .description("Show the current Copilot configuration.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching config...");
      const result = await ctx.assistant.getConfig();
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

config
  .command("update")
  .description("Update the Copilot configuration.")
  .requiredOption("--data <json>", "JSON payload, or @path/to/file.json.")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(assistant);
      const payload = ui.parseJsonOption(opts.data) || {};
      const spin = ui.spinner("Updating config...");
      const result = await ctx.assistant.updateConfig(payload);
      spin.stop();
      ui.printSuccess("Configuration updated.");
      ui.render(result, ctx.outputFormat);
    })
  );

const sessions = new Command("sessions").description("Copilot chat sessions.");
assistant.addCommand(sessions);

sessions
  .command("list")
  .description("List Copilot sessions.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching sessions...");
      const data = await ctx.assistant.listSessions();
      spin.stop();
      ui.render(data, ctx.outputFormat, ["id", "title", "state", "updated_at"]);
    })
  );

sessions
  .command("create")
  .description("Create a new Copilot session.")
  .option("--title <title>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Creating session...");
      const result = await ctx.assistant.createSession(opts.title);
      spin.stop();
      ui.printSuccess("Session created.");
      ui.render(result, ctx.outputFormat);
    })
  );

sessions
  .command("get")
  .description("Get a Copilot session by id.")
  .argument("<session_id>")
  .action(
    withErrorHandling(async (sessionId) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching session...");
      const result = await ctx.assistant.getSession(sessionId);
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

sessions
  .command("rename")
  .description("Rename a Copilot session.")
  .argument("<session_id>")
  .requiredOption("--title <title>")
  .action(
    withErrorHandling(async (sessionId, opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Updating session...");
      const result = await ctx.assistant.updateSession(sessionId, opts.title);
      spin.stop();
      ui.printSuccess("Session updated.");
      ui.render(result, ctx.outputFormat);
    })
  );

sessions
  .command("delete")
  .description("Delete a Copilot session.")
  .argument("<session_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (sessionId, opts) => {
      const ctx = ctxFrom(assistant);
      if (!opts.yes && !(await ui.confirm(`Delete session ${sessionId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Deleting session...");
      await ctx.assistant.deleteSession(sessionId);
      spin.stop();
      ui.printSuccess("Session deleted.");
    })
  );

sessions
  .command("state")
  .description("Show a session's current state.")
  .argument("<session_id>")
  .action(
    withErrorHandling(async (sessionId) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching state...");
      const result = await ctx.assistant.sessionState(sessionId);
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

sessions
  .command("stop")
  .description("Stop an in-progress session.")
  .argument("<session_id>")
  .action(
    withErrorHandling(async (sessionId) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Stopping session...");
      await ctx.assistant.stopSession(sessionId);
      spin.stop();
      ui.printSuccess("Session stopped.");
    })
  );

sessions
  .command("retry")
  .description("Retry a session from a given event id.")
  .argument("<session_id>")
  .requiredOption("--from-event <event_id>", "Event id to retry from.")
  .action(
    withErrorHandling(async (sessionId, opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Retrying...");
      const result = await ctx.assistant.retrySession(sessionId, Number(opts.fromEvent));
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

const events = new Command("events").description("Session event history.");
sessions.addCommand(events);

events
  .command("list")
  .description("List events for a session.")
  .argument("<session_id>")
  .action(
    withErrorHandling(async (sessionId) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching events...");
      const data = await ctx.assistant.listEvents(sessionId);
      spin.stop();
      ui.render(data, ctx.outputFormat, ["id", "sequence_number", "event_type", "created_at"]);
    })
  );

events
  .command("edit")
  .description("Edit the text content of a session event.")
  .argument("<session_id>")
  .argument("<event_id>")
  .requiredOption("--content <content>")
  .action(
    withErrorHandling(async (sessionId, eventId, opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Updating event...");
      const result = await ctx.assistant.editEvent(sessionId, Number(eventId), opts.content);
      spin.stop();
      ui.printSuccess("Event updated.");
      ui.render(result, ctx.outputFormat);
    })
  );

events
  .command("regenerate")
  .description("Regenerate an assistant message.")
  .argument("<session_id>")
  .argument("<event_id>")
  .option("--prompt <prompt>", "Optional rewrite instruction.")
  .action(
    withErrorHandling(async (sessionId, eventId, opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Regenerating...");
      const result = await ctx.assistant.regenerateEvent(sessionId, Number(eventId), opts.prompt);
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

events
  .command("feedback")
  .description("Leave feedback on an assistant message.")
  .argument("<session_id>")
  .argument("<event_id>")
  .requiredOption("--value <up|down>")
  .option("--note <note>")
  .action(
    withErrorHandling(async (sessionId, eventId, opts) => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Sending feedback...");
      await ctx.assistant.feedback(sessionId, Number(eventId), opts.value, opts.note);
      spin.stop();
      ui.printSuccess("Feedback recorded.");
    })
  );

assistant
  .command("analytics")
  .description("Show Copilot usage analytics.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(assistant);
      const spin = ui.spinner("Fetching analytics...");
      const result = await ctx.assistant.analytics();
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );
