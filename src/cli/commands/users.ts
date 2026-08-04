/** `studio users` -- user management and invitations. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const COLUMNS = ["id", "email", "full_name", "role", "is_staff", "created_at"];

export const users = buildCrudCommand("users", (ctx) => ctx.users, { columns: COLUMNS });

const invitations = new Command("invitations").description("User invitations.");
users.addCommand(invitations);

invitations
  .command("list")
  .description("List pending invitations for the current user.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(users);
      const spin = ui.spinner("Fetching invitations...");
      const data = await ctx.users.listInvitations();
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

invitations
  .command("accept")
  .description("Accept an invitation by token.")
  .argument("<token>")
  .action(
    withErrorHandling(async (token) => {
      const ctx = ctxFrom(users);
      const spin = ui.spinner("Accepting invitation...");
      const result = await ctx.users.acceptInvitation(token);
      spin.stop();
      ui.printSuccess("Invitation accepted.");
      ui.render(result, ctx.outputFormat);
    })
  );

invitations
  .command("decline")
  .description("Decline an invitation by token.")
  .argument("<token>")
  .action(
    withErrorHandling(async (token) => {
      const ctx = ctxFrom(users);
      const spin = ui.spinner("Declining invitation...");
      const result = await ctx.users.declineInvitation(token);
      spin.stop();
      ui.printSuccess("Invitation declined.");
      ui.render(result, ctx.outputFormat);
    })
  );
