/** Knowledge base service (standalone KBs and agent-linked KB endpoints). */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";
import { BaseService } from "./base";

export class KnowledgeBaseService extends BaseService {
  constructor(client: APIClient) {
    super(client, endpoints.KB_LIST, endpoints.KB_DETAIL as any);
  }

  // -- standalone KB documents -----------------------------------------------
  listDocuments(kbId: string) {
    return this.client.get(endpoints.KB_DOCUMENTS(kbId));
  }

  uploadDocument(kbId: string, filePath: string) {
    return this.client.upload(endpoints.KB_DOCUMENTS(kbId), filePath);
  }

  getDocument(kbId: string, docId: string) {
    return this.client.get(endpoints.KB_DOCUMENT_DETAIL(kbId, docId));
  }

  deleteDocument(kbId: string, docId: string) {
    return this.client.delete(endpoints.KB_DOCUMENT_DETAIL(kbId, docId));
  }

  documentChunks(kbId: string, docId: string) {
    return this.client.get(endpoints.KB_DOCUMENT_CHUNKS(kbId, docId));
  }

  // -- standalone KB domains ---------------------------------------------------
  listDomains(kbId: string) {
    return this.client.get(endpoints.KB_DOMAINS(kbId));
  }

  addDomain(kbId: string, domain: string) {
    return this.client.post(endpoints.KB_DOMAINS(kbId), { domain });
  }

  getDomain(kbId: string, domainId: string) {
    return this.client.get(endpoints.KB_DOMAIN_DETAIL(kbId, domainId));
  }

  deleteDomain(kbId: string, domainId: string) {
    return this.client.delete(endpoints.KB_DOMAIN_DETAIL(kbId, domainId));
  }

  crawlDomain(kbId: string, domainId: string) {
    return this.client.post(endpoints.KB_DOMAIN_CRAWL(kbId, domainId));
  }

  // -- standalone KB search / stats -------------------------------------------
  stats(kbId: string) {
    return this.client.get(endpoints.KB_STATS(kbId));
  }

  search(kbId: string, query: string, topK = 5) {
    return this.client.post(endpoints.KB_SEARCH(kbId), { query, top_k: topK });
  }

  // -- agent-linked KB endpoints -----------------------------------------------
  agentStats(agentId: string | number) {
    return this.client.get(endpoints.AGENT_KB_STATS(agentId));
  }

  agentListDocuments(agentId: string | number) {
    return this.client.get(endpoints.AGENT_KB_DOCUMENTS(agentId));
  }

  agentUploadDocument(agentId: string | number, filePath: string) {
    return this.client.upload(endpoints.AGENT_KB_DOCUMENTS(agentId), filePath);
  }

  agentGetDocument(agentId: string | number, docId: string) {
    return this.client.get(endpoints.AGENT_KB_DOCUMENT_DETAIL(agentId, docId));
  }

  agentDeleteDocument(agentId: string | number, docId: string) {
    return this.client.delete(endpoints.AGENT_KB_DOCUMENT_DETAIL(agentId, docId));
  }

  agentDocumentChunks(agentId: string | number, docId: string) {
    return this.client.get(endpoints.AGENT_KB_DOCUMENT_CHUNKS(agentId, docId));
  }

  agentListDomains(agentId: string | number) {
    return this.client.get(endpoints.AGENT_KB_DOMAINS(agentId));
  }

  agentAddDomain(agentId: string | number, domain: string) {
    return this.client.post(endpoints.AGENT_KB_DOMAINS(agentId), { domain });
  }

  agentDeleteDomain(agentId: string | number, domainId: string) {
    return this.client.delete(endpoints.AGENT_KB_DOMAIN_DETAIL(agentId, domainId));
  }

  agentCrawlDomain(agentId: string | number, domainId: string) {
    return this.client.post(endpoints.AGENT_KB_DOMAIN_CRAWL(agentId, domainId));
  }

  agentSearch(agentId: string | number, query: string, topK = 5) {
    return this.client.post(endpoints.AGENT_KB_SEARCH(agentId), { query, top_k: topK });
  }

  agentTest(agentId: string | number, testQuery: string) {
    return this.client.post(endpoints.AGENT_KB_TEST(agentId), { test_query: testQuery });
  }

  // -- agent <-> KB attachments -------------------------------------------------
  listAttachments(agentId: string | number) {
    return this.client.get(endpoints.AGENT_KB_ATTACHMENTS(agentId));
  }

  attach(agentId: string | number, knowledgeBaseId: string, options: Record<string, unknown> = {}) {
    return this.client.post(endpoints.AGENT_KB_ATTACHMENTS(agentId), {
      knowledge_base_id: knowledgeBaseId,
      ...options,
    });
  }

  updateAttachment(agentId: string | number, attachmentId: string, options: Record<string, unknown>) {
    return this.client.put(endpoints.AGENT_KB_ATTACHMENT_DETAIL(agentId, attachmentId), options);
  }

  detach(agentId: string | number, attachmentId: string) {
    return this.client.delete(endpoints.AGENT_KB_ATTACHMENT_DETAIL(agentId, attachmentId));
  }

  available(agentId: string | number) {
    return this.client.get(endpoints.AGENT_KB_AVAILABLE(agentId));
  }
}
