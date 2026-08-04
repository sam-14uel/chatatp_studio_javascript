/** `studio auth` -- signup, login, logout, whoami, oauth, password reset. */
import { Command } from "commander";

import { CLIContext } from "../context";
import { ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

export const auth = new Command("auth").description("Authentication and account commands.");

function storeTokenBundle(ctx: CLIContext, result: any): void {
  const cfg = ctx.config;
  cfg.access = result.access;
  cfg.refresh = result.refresh;
  cfg.token = result.token;
  const user = result.user || {};
  cfg.user_email = user.email;
  cfg.user_id = user.id;
  cfg.save();
}

auth
  .command("signup")
  .description("Create a new ChatATP Studio account.")
  .requiredOption("--email <email>")
  .requiredOption("--name <name>")
  .requiredOption("--password <password>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Creating account...");
      const result = await ctx.auth.signup(opts.email, opts.password, opts.name);
      spin.stop();
      storeTokenBundle(ctx, result);
      ui.printSuccess(`Account created and signed in as ${opts.email}.`);
    })
  );

auth
  .command("login")
  .description("Sign in and store the session token in the local config.")
  .requiredOption("--email <email>")
  .requiredOption("--password <password>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Signing in...");
      const result = await ctx.auth.signin(opts.email, opts.password);
      spin.stop();
      storeTokenBundle(ctx, result);
      ui.printSuccess(`Signed in as ${opts.email}.`);
    })
  );

auth
  .command("logout")
  .description("Sign out and clear local credentials.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(auth);
      if (ctx.config.isAuthenticated()) {
        try {
          await ctx.auth.signout();
        } catch {
          // best-effort; still clear local credentials
        }
      }
      ctx.config.clearCredentials();
      ctx.config.save();
      ui.printSuccess("Signed out.");
    })
  );

auth
  .command("whoami")
  .description("Show the currently authenticated user.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Fetching current user...");
      const me = await ctx.auth.me();
      spin.stop();
      ui.render(me, ctx.outputFormat);
    })
  );

auth
  .command("update-profile")
  .description("Update the current user's profile.")
  .option("--name <name>")
  .option("--avatar-url <url>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const fields: Record<string, unknown> = {};
      if (opts.name !== undefined) fields.name = opts.name;
      if (opts.avatarUrl !== undefined) fields.avatar_url = opts.avatarUrl;
      if (!Object.keys(fields).length) {
        ui.printWarning("Nothing to update. Pass --name and/or --avatar-url.");
        return;
      }
      const spin = ui.spinner("Updating profile...");
      const result = await ctx.auth.updateProfile(fields);
      spin.stop();
      ui.printSuccess("Profile updated.");
      ui.render(result, ctx.outputFormat);
    })
  );

auth
  .command("onboarding")
  .description("Submit onboarding details for the current user.")
  .requiredOption("--role <role>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Submitting onboarding...");
      const result = await ctx.auth.onboarding({ role: opts.role });
      spin.stop();
      ui.printSuccess("Onboarding submitted.");
      ui.render(result, ctx.outputFormat);
    })
  );

auth
  .command("forgot-password")
  .description("Request a password reset email.")
  .requiredOption("--email <email>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Requesting reset...");
      await ctx.auth.forgotPassword(opts.email);
      spin.stop();
      ui.printSuccess("If that account exists, a reset email has been sent.");
    })
  );

auth
  .command("reset-password")
  .description("Reset a password using a reset token.")
  .requiredOption("--token <token>")
  .requiredOption("--password <password>")
  .action(
    withErrorHandling(async (opts) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Resetting password...");
      await ctx.auth.resetPassword(opts.token, opts.password);
      spin.stop();
      ui.printSuccess("Password reset. You can now log in.");
    })
  );

auth
  .command("oauth-providers")
  .description("List available OAuth login providers.")
  .action(
    withErrorHandling(async () => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Fetching providers...");
      const result = await ctx.auth.oauthProviders();
      spin.stop();
      ui.render(result, ctx.outputFormat);
    })
  );

auth
  .command("oauth-start")
  .description("Start an OAuth login flow for PROVIDER and print the URL to open.")
  .argument("<provider>")
  .action(
    withErrorHandling(async (provider) => {
      const ctx = ctxFrom(auth);
      const spin = ui.spinner("Starting OAuth flow...");
      const result = await ctx.auth.oauthStart(provider);
      spin.stop();
      if (result?.authorization_url) {
        ui.printInfo(`Open this URL in your browser to continue: ${result.authorization_url}`);
      }
      ui.render(result, ctx.outputFormat);
    })
  );
