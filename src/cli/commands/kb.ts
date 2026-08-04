/** `studio kb` -- standalone knowledge bases and agent-linked KB endpoints. */
import { Command } from "commander";

import { buildCrudCommand, ctxFrom, withErrorHandling } from "../crud";
import * as ui from "../ui";

export const kb = buildCrudCommand("kb", (ctx) => ctx.kb, {
  columns: ["id", "name", "description", "status", "created_at"],
});

// -- standalone KB documents -------------------------------------------------
const documents = new Command("documents").description("Documents within a standalone knowledge base.");
kb.addCommand(documents);

documents
  .command("list")
  .description("List documents in a knowledge base.")
  .argument("<kb_id>")
  .action(
    withErrorHandling(async (kbId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching documents...");
      const data = await ctx.kb.listDocuments(kbId);
      spin.stop();
      ui.render(data, ctx.outputFormat, ["id", "name", "file_type", "status", "chunk_count"]);
    })
  );

documents
  .command("upload")
  .description("Upload a document to a knowledge base.")
  .argument("<kb_id>")
  .requiredOption("--file <path>", "Local file to upload.")
  .action(
    withErrorHandling(async (kbId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Uploading document...");
      const result = await ctx.kb.uploadDocument(kbId, opts.file);
      spin.stop();
      ui.printSuccess("Document uploaded.");
      ui.render(result, ctx.outputFormat);
    })
  );

documents
  .command("get")
  .description("Get a knowledge base document.")
  .argument("<kb_id>")
  .argument("<doc_id>")
  .action(
    withErrorHandling(async (kbId, docId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching document...");
      const data = await ctx.kb.getDocument(kbId, docId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

documents
  .command("delete")
  .description("Delete a knowledge base document.")
  .argument("<kb_id>")
  .argument("<doc_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (kbId, docId, opts) => {
      const ctx = ctxFrom(kb);
      if (!opts.yes && !(await ui.confirm(`Delete document ${docId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Deleting document...");
      await ctx.kb.deleteDocument(kbId, docId);
      spin.stop();
      ui.printSuccess("Document deleted.");
    })
  );

documents
  .command("chunks")
  .description("List the indexed chunks for a document.")
  .argument("<kb_id>")
  .argument("<doc_id>")
  .action(
    withErrorHandling(async (kbId, docId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching chunks...");
      const data = await ctx.kb.documentChunks(kbId, docId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

// -- standalone KB domains ---------------------------------------------------
const domains = new Command("domains").description("Crawlable web domains within a standalone knowledge base.");
kb.addCommand(domains);

domains
  .command("list")
  .description("List domains attached to a knowledge base.")
  .argument("<kb_id>")
  .action(
    withErrorHandling(async (kbId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching domains...");
      const data = await ctx.kb.listDomains(kbId);
      spin.stop();
      ui.render(data, ctx.outputFormat, ["id", "domain", "status", "pages_crawled"]);
    })
  );

domains
  .command("add")
  .description("Add a domain to a knowledge base.")
  .argument("<kb_id>")
  .requiredOption("--url <domain>", "Domain URL to crawl, e.g. https://example.com")
  .action(
    withErrorHandling(async (kbId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Adding domain...");
      const result = await ctx.kb.addDomain(kbId, opts.url);
      spin.stop();
      ui.printSuccess("Domain added.");
      ui.render(result, ctx.outputFormat);
    })
  );

domains
  .command("get")
  .description("Get a knowledge base domain.")
  .argument("<kb_id>")
  .argument("<domain_id>")
  .action(
    withErrorHandling(async (kbId, domainId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching domain...");
      const data = await ctx.kb.getDomain(kbId, domainId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

domains
  .command("delete")
  .description("Delete a knowledge base domain.")
  .argument("<kb_id>")
  .argument("<domain_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (kbId, domainId, opts) => {
      const ctx = ctxFrom(kb);
      if (!opts.yes && !(await ui.confirm(`Delete domain ${domainId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Deleting domain...");
      await ctx.kb.deleteDomain(kbId, domainId);
      spin.stop();
      ui.printSuccess("Domain deleted.");
    })
  );

domains
  .command("crawl")
  .description("Trigger a crawl for a knowledge base domain.")
  .argument("<kb_id>")
  .argument("<domain_id>")
  .action(
    withErrorHandling(async (kbId, domainId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Starting crawl...");
      const result = await ctx.kb.crawlDomain(kbId, domainId);
      spin.stop();
      ui.printSuccess("Crawl started.");
      ui.render(result, ctx.outputFormat);
    })
  );

// -- standalone KB search / stats -------------------------------------------
kb.command("stats")
  .description("Show indexing stats for a knowledge base.")
  .argument("<kb_id>")
  .action(
    withErrorHandling(async (kbId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching stats...");
      const data = await ctx.kb.stats(kbId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

kb.command("search")
  .description("Search a knowledge base.")
  .argument("<kb_id>")
  .requiredOption("-q, --query <query>")
  .option("--top-k <n>", "Number of results", "5")
  .action(
    withErrorHandling(async (kbId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Searching...");
      const data = await ctx.kb.search(kbId, opts.query, Number(opts.topK));
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

// -- agent-linked KB endpoints ------------------------------------------------
const agentKb = new Command("agent").description("Knowledge-base endpoints scoped to a specific agent.");
kb.addCommand(agentKb);

agentKb
  .command("stats")
  .description("Show KB stats for an agent.")
  .argument("<agent_id>")
  .action(
    withErrorHandling(async (agentId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching stats...");
      const data = await ctx.kb.agentStats(agentId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

const agentDocuments = new Command("documents").description(
  "Documents directly attached to an agent's built-in knowledge base."
);
agentKb.addCommand(agentDocuments);

agentDocuments
  .command("list")
  .description("List an agent's KB documents.")
  .argument("<agent_id>")
  .action(
    withErrorHandling(async (agentId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching documents...");
      const data = await ctx.kb.agentListDocuments(agentId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

agentDocuments
  .command("upload")
  .description("Upload a document to an agent's KB.")
  .argument("<agent_id>")
  .requiredOption("--file <path>")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Uploading document...");
      const result = await ctx.kb.agentUploadDocument(agentId, opts.file);
      spin.stop();
      ui.printSuccess("Document uploaded.");
      ui.render(result, ctx.outputFormat);
    })
  );

agentDocuments
  .command("get")
  .description("Get an agent's KB document.")
  .argument("<agent_id>")
  .argument("<doc_id>")
  .action(
    withErrorHandling(async (agentId, docId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching document...");
      const data = await ctx.kb.agentGetDocument(agentId, docId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

agentDocuments
  .command("delete")
  .description("Delete an agent's KB document.")
  .argument("<agent_id>")
  .argument("<doc_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (agentId, docId, opts) => {
      const ctx = ctxFrom(kb);
      if (!opts.yes && !(await ui.confirm(`Delete document ${docId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Deleting document...");
      await ctx.kb.agentDeleteDocument(agentId, docId);
      spin.stop();
      ui.printSuccess("Document deleted.");
    })
  );

agentDocuments
  .command("chunks")
  .description("List chunks for an agent's KB document.")
  .argument("<agent_id>")
  .argument("<doc_id>")
  .action(
    withErrorHandling(async (agentId, docId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching chunks...");
      const data = await ctx.kb.agentDocumentChunks(agentId, docId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

const agentDomains = new Command("domains").description(
  "Domains directly attached to an agent's built-in knowledge base."
);
agentKb.addCommand(agentDomains);

agentDomains
  .command("list")
  .description("List an agent's KB domains.")
  .argument("<agent_id>")
  .action(
    withErrorHandling(async (agentId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching domains...");
      const data = await ctx.kb.agentListDomains(agentId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

agentDomains
  .command("add")
  .description("Add a domain to an agent's KB.")
  .argument("<agent_id>")
  .requiredOption("--url <domain>")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Adding domain...");
      const result = await ctx.kb.agentAddDomain(agentId, opts.url);
      spin.stop();
      ui.printSuccess("Domain added.");
      ui.render(result, ctx.outputFormat);
    })
  );

agentDomains
  .command("delete")
  .description("Delete a domain from an agent's KB.")
  .argument("<agent_id>")
  .argument("<domain_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (agentId, domainId, opts) => {
      const ctx = ctxFrom(kb);
      if (!opts.yes && !(await ui.confirm(`Delete domain ${domainId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Deleting domain...");
      await ctx.kb.agentDeleteDomain(agentId, domainId);
      spin.stop();
      ui.printSuccess("Domain deleted.");
    })
  );

agentDomains
  .command("crawl")
  .description("Trigger a crawl for an agent's KB domain.")
  .argument("<agent_id>")
  .argument("<domain_id>")
  .action(
    withErrorHandling(async (agentId, domainId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Starting crawl...");
      const result = await ctx.kb.agentCrawlDomain(agentId, domainId);
      spin.stop();
      ui.printSuccess("Crawl started.");
      ui.render(result, ctx.outputFormat);
    })
  );

agentKb
  .command("search")
  .description("Search an agent's knowledge base.")
  .argument("<agent_id>")
  .requiredOption("-q, --query <query>")
  .option("--top-k <n>", "Number of results", "5")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Searching...");
      const data = await ctx.kb.agentSearch(agentId, opts.query, Number(opts.topK));
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

agentKb
  .command("test")
  .description("Run a KB retrieval test query for an agent.")
  .argument("<agent_id>")
  .requiredOption("-q, --query <query>")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Testing...");
      const data = await ctx.kb.agentTest(agentId, opts.query);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

// -- agent <-> KB attachments -------------------------------------------------
const attachments = new Command("attachments").description("Attach or detach standalone knowledge bases from an agent.");
agentKb.addCommand(attachments);

attachments
  .command("list")
  .description("List knowledge bases attached to an agent.")
  .argument("<agent_id>")
  .action(
    withErrorHandling(async (agentId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching attachments...");
      const data = await ctx.kb.listAttachments(agentId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

attachments
  .command("available")
  .description("List knowledge bases available to attach to an agent.")
  .argument("<agent_id>")
  .action(
    withErrorHandling(async (agentId) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Fetching available knowledge bases...");
      const data = await ctx.kb.available(agentId);
      spin.stop();
      ui.render(data, ctx.outputFormat);
    })
  );

attachments
  .command("attach")
  .description("Attach a standalone knowledge base to an agent.")
  .argument("<agent_id>")
  .requiredOption("--kb-id <kb_id>", "Knowledge base id to attach.")
  .option("--enabled", "Enable the attachment.", true)
  .option("--disabled", "Disable the attachment.")
  .option("--auto-context", "Enable automatic context injection.", true)
  .option("--no-auto-context", "Disable automatic context injection.")
  .option("--max-context-chunks <n>", "Max context chunks.", "3")
  .option("--context-threshold <n>", "Similarity threshold.", "0.3")
  .action(
    withErrorHandling(async (agentId, opts) => {
      const ctx = ctxFrom(kb);
      const spin = ui.spinner("Attaching...");
      const result = await ctx.kb.attach(agentId, opts.kbId, {
        enabled: !opts.disabled,
        auto_context: opts.autoContext,
        max_context_chunks: Number(opts.maxContextChunks),
        context_threshold: Number(opts.contextThreshold),
      });
      spin.stop();
      ui.printSuccess("Knowledge base attached.");
      ui.render(result, ctx.outputFormat);
    })
  );

attachments
  .command("update")
  .description("Update an agent's knowledge-base attachment settings.")
  .argument("<agent_id>")
  .argument("<attachment_id>")
  .requiredOption("--data <json>", "JSON payload, or @path/to/file.json.")
  .action(
    withErrorHandling(async (agentId, attachmentId, opts) => {
      const ctx = ctxFrom(kb);
      const payload = ui.parseJsonOption(opts.data) || {};
      const spin = ui.spinner("Updating attachment...");
      const result = await ctx.kb.updateAttachment(agentId, attachmentId, payload);
      spin.stop();
      ui.printSuccess("Attachment updated.");
      ui.render(result, ctx.outputFormat);
    })
  );

attachments
  .command("detach")
  .description("Detach a knowledge base from an agent.")
  .argument("<agent_id>")
  .argument("<attachment_id>")
  .option("-y, --yes", "Skip confirmation.", false)
  .action(
    withErrorHandling(async (agentId, attachmentId, opts) => {
      const ctx = ctxFrom(kb);
      if (!opts.yes && !(await ui.confirm(`Detach knowledge base attachment ${attachmentId}?`))) {
        ui.printInfo("Cancelled.");
        return;
      }
      const spin = ui.spinner("Detaching...");
      await ctx.kb.detach(agentId, attachmentId);
      spin.stop();
      ui.printSuccess("Knowledge base detached.");
    })
  );
