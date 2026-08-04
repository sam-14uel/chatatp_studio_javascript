/** `studio teams` -- teams, members, and invitations. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

const COLUMNS = ["id", "name", "slug", "member_count", "my_role", "created_at"];

export const teams = buildCrudCommand("teams", (ctx) => ctx.teams, { columns: COLUMNS });

const members = new Command("members").description("Team member management.");
teams.addCommand(members);

members
  .command("list")
  .description("List members of TEAM_ID.")
  .argument("<team_id>")
  .action(
    withErrorHandling(async (teamId) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Fetching members...");
      const data = await ctx.teams.listMembers(teamId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

members
  .command("add")
  .description("Add a user to TEAM_ID.")
  .argument("<team_id>")
  .requiredOption("--user <user_id>", "User id to add.")
  .option("--role <role>", "Role", "member")
  .action(
    withErrorHandling(async (teamId, opts) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Adding member...");
      const result = await ctx.teams.addMember(teamId, opts.user, opts.role);
      spin.stop();
      ui.printSuccess("Member added.");
      ui.render(result, ctx.outputFormat);
    })
  );

members
  .command("remove")
  .description("Remove USER_ID from TEAM_ID.")
  .argument("<team_id>")
  .argument("<user_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (teamId, userId, opts) => {
      const ctx = ctxFrom(teams);
      if (!opts.yes && !(await ui.confirm(`Remove user ${userId} from team ${teamId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Removing member...");
      await ctx.teams.removeMember(teamId, userId);
      spin.stop();
      ui.printSuccess("Member removed.");
    })
  );

const invitations = new Command("invitations").description("Team invitation management.");
teams.addCommand(invitations);

invitations
  .command("list")
  .description("List invitations for TEAM_ID.")
  .argument("<team_id>")
  .action(
    withErrorHandling(async (teamId) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Fetching invitations...");
      const data = await ctx.teams.listInvitations(teamId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

invitations
  .command("create")
  .description("Invite EMAIL to TEAM_ID.")
  .argument("<team_id>")
  .requiredOption("--email <email>")
  .option("--role <role>", "Role", "member")
  .action(
    withErrorHandling(async (teamId, opts) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Sending invitation...");
      const result = await ctx.teams.createInvitation(teamId, opts.email, opts.role);
      spin.stop();
      ui.printSuccess("Invitation sent.");
      ui.render(result, ctx.outputFormat);
    })
  );

invitations
  .command("accept")
  .description("Accept a team invitation by token.")
  .argument("<token>")
  .action(
    withErrorHandling(async (token) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Accepting invitation...");
      const result = await ctx.teams.acceptInvitation(token);
      spin.stop();
      ui.printSuccess("Invitation accepted.");
      ui.render(result, ctx.outputFormat);
    })
  );

invitations
  .command("decline")
  .description("Decline a team invitation by token.")
  .argument("<token>")
  .action(
    withErrorHandling(async (token) => {
      const ctx = ctxFrom(teams);
      const spin = ui.spinner("Declining invitation...");
      const result = await ctx.teams.declineInvitation(token);
      spin.stop();
      ui.printSuccess("Invitation declined.");
      ui.render(result, ctx.outputFormat);
    })
  );
