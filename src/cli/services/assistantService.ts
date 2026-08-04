/** Assistant / Copilot chat, config, sessions, and analytics service. */
import { APIClient } from "../apiClient";
import * as endpoints from "../endpoints";

export class AssistantService {
  constructor(private client: APIClient) {}

  chat(messages: { role: string; content: string }[], sessionId?: string) {
    const payload: Record<string, unknown> = { messages };
    if (sessionId) payload.session_id = sessionId;
    return this.client.post(endpoints.ASSISTANT_CHAT, payload);
  }

  getConfig() {
    return this.client.get(endpoints.ASSISTANT_CONFIG);
  }

  updateConfig(fields: Record<string, unknown>) {
    return this.client.patch(endpoints.ASSISTANT_CONFIG, fields);
  }

  listSessions() {
    return this.client.get(endpoints.ASSISTANT_SESSIONS);
  }

  createSession(title?: string) {
    return this.client.post(endpoints.ASSISTANT_SESSION_CREATE, title ? { title } : {});
  }

  getSession(sessionId: string) {
    return this.client.get(endpoints.ASSISTANT_SESSION_DETAIL(sessionId));
  }

  updateSession(sessionId: string, title: string) {
    return this.client.patch(endpoints.ASSISTANT_SESSION_DETAIL(sessionId), { title });
  }

  deleteSession(sessionId: string) {
    return this.client.delete(endpoints.ASSISTANT_SESSION_DETAIL(sessionId));
  }

  sessionState(sessionId: string) {
    return this.client.get(endpoints.ASSISTANT_SESSION_STATE(sessionId));
  }

  stopSession(sessionId: string) {
    return this.client.post(endpoints.ASSISTANT_SESSION_STOP(sessionId));
  }

  retrySession(sessionId: string, fromEventId: number) {
    return this.client.post(endpoints.ASSISTANT_SESSION_RETRY(sessionId), { from_event_id: fromEventId });
  }

  listEvents(sessionId: string) {
    return this.client.get(endpoints.ASSISTANT_SESSION_EVENTS(sessionId));
  }

  editEvent(sessionId: string, eventId: number, content: string) {
    return this.client.patch(endpoints.ASSISTANT_SESSION_EVENT_DETAIL(sessionId, eventId), { content });
  }

  regenerateEvent(sessionId: string, eventId: number, prompt?: string) {
    return this.client.post(
      endpoints.ASSISTANT_SESSION_EVENT_REGENERATE(sessionId, eventId),
      prompt ? { prompt } : {}
    );
  }

  feedback(sessionId: string, eventId: number, value: string, note?: string) {
    const payload: Record<string, unknown> = { value };
    if (note) payload.note = note;
    return this.client.post(endpoints.ASSISTANT_SESSION_EVENT_FEEDBACK(sessionId, eventId), payload);
  }

  analytics() {
    return this.client.get(endpoints.ASSISTANT_ANALYTICS);
  }
}
