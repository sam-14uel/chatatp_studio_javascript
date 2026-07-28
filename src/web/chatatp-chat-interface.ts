import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ChatATPClient } from '../client.js';

import './components/copilot-avatar.js';
import './components/thinking-indicator.js';
import './components/empty-state.js';
import './components/menus.js';

interface ToolCall {
  id: string;
  name: string;
  arguments: any;
  result?: string;
  ok?: boolean;
  status: 'started' | 'completed' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
  isError?: boolean;
}

@customElement('chatatp-chat-interface')
export class ChatATPChatInterface extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(180deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.10), var(--chatatp-background, #ffffff) 42%);
      color: var(--chatatp-foreground, #0f172a);
      font-family: var(--chatatp-font, 'Inter', system-ui, sans-serif);
    }
    
    .chat-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.18);
      background: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.08);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--chatatp-foreground, #0f172a);
      transition: background-color 0.2s;
    }
    .icon-btn:hover {
      background-color: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.12);
    }
    .icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message-row {
      display: flex;
      width: 100%;
    }
    .message-row.user { justify-content: flex-end; }
    .message-row.agent { justify-content: flex-start; }

    .message-bubble {
      max-width: 85%;
      padding: 8px 14px;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.5;
      position: relative;
    }
    .message-row.user .message-bubble {
      background: linear-gradient(135deg, var(--chatatp-primary, #0ea5e9), var(--chatatp-secondary, #6366f1));
      color: var(--chatatp-primary-foreground, #ffffff);
      border-bottom-right-radius: 2px;
      white-space: pre-wrap;
    }
    .message-row.agent .message-bubble {
      background-color: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.10);
      color: var(--chatatp-foreground, #0f172a);
      border-bottom-left-radius: 2px;
    }

    .action-card {
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      background-color: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.08);
      border-radius: 8px;
      font-size: 0.6875rem;
      overflow: hidden;
      margin-bottom: 4px;
      width: 100%;
    }
    .action-card.error {
      border-color: rgba(239, 68, 68, 0.4);
      background-color: rgba(239, 68, 68, 0.05);
    }

    .action-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      cursor: pointer;
    }
    .action-header:hover {
      background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.5);
    }
    
    .spinner {
      width: 11px;
      height: 11px;
      border: 2px solid rgba(var(--chatatp-muted-foreground-rgb, 100, 116, 139), 0.3);
      border-top-color: var(--chatatp-muted-foreground, #64748b);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .input-area {
      border-top: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      padding: 12px 16px;
      background: linear-gradient(180deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.10), var(--chatatp-background, #ffffff) 42%);
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      border-radius: 16px;
      border: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.28);
      background: color-mix(in srgb, var(--chatatp-secondary) 20%, #ffffff);
      padding: 10px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .input-box {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px;
      font-size: 0.875rem;
      resize: none;
      min-height: 40px;
      max-height: 128px;
      outline: none;
      color: var(--chatatp-foreground, #0f172a) !important;
      -webkit-text-fill-color: var(--chatatp-foreground, #0f172a) !important;
      text-shadow: none !important;
      caret-color: var(--chatatp-primary, #0ea5e9);
      font-family: inherit;
    }
    
    .send-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--chatatp-primary, #0ea5e9), var(--chatatp-secondary, #6366f1));
      color: white;
      border: none;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .send-btn:hover { transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
    
    .stop-btn {
      background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 1);
      color: var(--chatatp-foreground, #0f172a);
    }


    .page-shell {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      width: 100%;
      height: 100%;
      min-height: 100vh;
      background: linear-gradient(135deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.16), var(--chatatp-background, #ffffff));
    }
    .page-shell.collapsed { grid-template-columns: 72px minmax(0, 1fr); }
    .page-sidebar {
      border-right: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.2);
      background: linear-gradient(180deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.34), rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.18));
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }
    .page-sidebar-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px;
      border-bottom: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.16);
    }
    .sidebar-toggle, .sidebar-new-chat {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      border-radius: 10px;
      border: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.22);
      background: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.10);
      color: var(--chatatp-foreground, #0f172a);
      cursor: pointer;
    }
    .sidebar-toggle { width: 34px; }
    .sidebar-new-chat { flex: 1; gap: 8px; padding: 0 10px; font-size: 0.875rem; }
    .page-shell.collapsed .sidebar-new-chat span, .page-shell.collapsed .sidebar-title, .page-shell.collapsed .session-title { display: none; }
    .page-sessions {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .session-button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      border: none;
      background: transparent;
      color: var(--chatatp-foreground, #0f172a);
      border-radius: 10px;
      padding: 10px;
      cursor: pointer;
      text-align: left;
      font-size: 0.875rem;
    }
    .session-button:hover { background: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.12); }
    .session-button.active { background: rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.14); color: var(--chatatp-primary, #0ea5e9); }
    .page-main {
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      background: color-mix(in srgb, var(--chatatp-secondary) 14%, #ffffff);
      box-shadow: 0 0 0 1px rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.08);
    }

  `;

  @property({ type: String }) agentId = '';
  @property({ type: String }) userId = 'anonymous';
  @property({ type: String }) userDisplayName = 'User';
  @property({ type: String }) apiKey = '';
  @property({ type: String }) baseUrl = '';
  @property({ type: String }) mode = 'popup';
  @property({ type: Boolean }) isActive = false;
  @property({ type: String }) statusText = 'Ask anything about your agents, platforms or tools.';
  @property({ type: String }) inputPlaceholder = 'Ask the copilot...';
  @property({ type: String }) emptyHeading = 'What are we building today?';
  @property({ type: String }) emptySubheading = 'Ask me anything, or pick a starting point below.';
  @property({ type: Array }) quickActions : any[] = [];

  @state() messages : Message[] = [];
  @state() sessions : any[] = [];
  @state() inputValue = '';
  @state() isGenerating = false;
  @state() conversationId : number | null = null;
  @state() streamStatus : string | null = null;
  @state() historyCollapsed = false;

  @query('.messages-area') private messagesArea!: HTMLElement;
  @query('.input-box') private inputBox!: HTMLTextAreaElement;

  private client: ChatATPClient | null = null;
  private abortController: AbortController | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (this.apiKey) {
      this.client = new ChatATPClient({
        apiKey: this.apiKey,
        baseUrl: this.baseUrl || 'http://localhost:8000'
      });
      this.loadSessions();
    }
  }
  
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('isActive') && this.isActive) {
      setTimeout(() => {
        if (this.inputBox) {
          this.inputBox.focus();
        }
        this.scrollToBottom();
      }, 100);
    }
  }

  private async loadSessions() {
    if (!this.client) return;
    try {
      const page = await this.client.conversations.list({
        agent_id: parseInt(this.agentId, 10) || undefined,
        external_user_id: this.userId
      });
      const conversations = await page.toArray();
      this.sessions = conversations.map((conversation: any) => ({
        id: conversation.id?.toString(),
        title: conversation.title || conversation.user_display_name || `Conversation #${conversation.id}`,
        updatedAt: conversation.last_message_at || conversation.updated_at || conversation.created_at
      }));
    } catch (error) {
      console.warn('Failed to load copilot conversations', error);
      this.sessions = [];
    }
  }

  private startNewChat() {
    this.conversationId = null;
    this.messages = [];
  }

  private async switchSession(sessionId: string | number) {
    if (!this.client || !sessionId) return;
    const numericId = Number(sessionId);
    if (!Number.isFinite(numericId)) return;
    this.conversationId = numericId;
    try {
      const page = await this.client.messages.list(numericId);
      const history = await page.toArray();
      this.messages = history.map((message: any) => ({
        id: message.id?.toString?.() || `${message.sender}-${message.timestamp}`,
        role: message.sender === 'user' ? 'user' : 'agent',
        content: message.content || '',
        toolCalls: Array.isArray(message.tool_calls) ? message.tool_calls : []
      }));
      this.scrollToBottom();
    } catch (error) {
      console.warn('Failed to load copilot conversation messages', error);
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesArea) {
        this.messagesArea.scrollTo({ top: this.messagesArea.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.inputValue = target.value;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private stopGeneration() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isGenerating = false;
      this.streamStatus = null;
      
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        this.finalizeAgentMessage(lastMessage.id, lastMessage.content);
      }
    }
  }

  private async sendMessage(text?: string) {
    const userMessage = text || this.inputValue.trim();
    if (!userMessage || this.isGenerating || !this.client) return;

    this.inputValue = '';
    if (this.inputBox) {
      this.inputBox.style.height = 'auto';
    }

    const messageId = Date.now().toString();
    this.messages = [
      ...this.messages,
      { id: `user-${messageId}`, role: 'user', content: userMessage }
    ];
    
    this.scrollToBottom();
    this.isGenerating = true;
    this.streamStatus = "Thinking...";

    const agentMsgId = `agent-${messageId}`;
    this.messages = [
      ...this.messages,
      { id: agentMsgId, role: 'agent', content: '', toolCalls: [], isStreaming: true }
    ];

    this.abortController = new AbortController();

    try {
      let currentContent = '';
      
      const stream = this.conversationId
        ? this.client.messages.stream(this.conversationId, { content: userMessage })
        : this.client.chatStream({
            agent_id: parseInt(this.agentId, 10) || 0,
            external_user_id: this.userId,
            user_display_name: this.userDisplayName,
            message: userMessage,
            // @ts-ignore
            signal: this.abortController.signal
          });

      for await (const event of stream) {
        if (this.abortController?.signal.aborted) break;

        switch (event.type) {
          case 'conversation.message.created':
            this.conversationId = (event.data as any).conversation_id;
            break;
          case 'tool.execution.started':
            this.updateToolCall(agentMsgId, {
              id: (event.data as any).tool_call_id,
              name: (event.data as any).name,
              arguments: (event.data as any).arguments,
              status: 'started'
            });
            this.scrollToBottom();
            break;
          case 'tool.execution.completed':
            this.updateToolCall(agentMsgId, {
              id: (event.data as any).tool_call_id,
              name: (event.data as any).name,
              arguments: {},
              result: (event.data as any).result,
              ok: (event.data as any).ok,
              status: (event.data as any).ok ? 'completed' : 'error'
            });
            this.scrollToBottom();
            break;
          case 'agent.response.delta':
            currentContent += (event.data as any).delta || '';
            this.streamStatus = currentContent ? "Typing..." : "Thinking...";
            this.updateAgentMessage(agentMsgId, currentContent);
            this.scrollToBottom();
            break;
          case 'error':
            throw new Error((event.data as any).message);
        }
      }
      
      if (!this.abortController?.signal.aborted) {
        this.finalizeAgentMessage(agentMsgId, currentContent);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && !this.abortController?.signal.aborted) {
        console.error('Chat error:', error);
        this.updateAgentMessage(agentMsgId, 'Sorry, I encountered an error while processing your request: ' + error.message, true);
        this.finalizeAgentMessage(agentMsgId, 'Sorry, I encountered an error while processing your request: ' + error.message);
      }
    } finally {
      this.isGenerating = false;
      this.streamStatus = null;
      this.abortController = null;
      this.scrollToBottom();
      this.loadSessions();
    }
  }
  
  private updateToolCall(msgId: string, toolCall: ToolCall) {
    this.messages = this.messages.map(m => {
      if (m.id === msgId) {
        const existingToolCalls = m.toolCalls || [];
        const index = existingToolCalls.findIndex(tc => tc.id === toolCall.id);
        
        let newToolCalls;
        if (index >= 0) {
          newToolCalls = [...existingToolCalls];
          newToolCalls[index] = { ...newToolCalls[index], ...toolCall };
        } else {
          newToolCalls = [...existingToolCalls, toolCall];
        }
        return { ...m, toolCalls: newToolCalls };
      }
      return m;
    });
  }

  private updateAgentMessage(id: string, content: string, isError = false) {
    this.messages = this.messages.map(m => 
      m.id === id ? { ...m, content, isError } : m
    );
  }
  
  private finalizeAgentMessage(id: string, content: string) {
    this.messages = this.messages.map(m => 
      m.id === id ? { ...m, content, isStreaming: false } : m
    );
  }

  private renderMarkdown(content: string) {
    const rawHtml = marked.parse(content) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return html`<div class="markdown-body" .innerHTML="${cleanHtml}"></div>`;
  }

  private renderToolCall(tc: ToolCall) {
    const isError = tc.status === 'error' || (tc.status === 'completed' && !tc.ok);
    return html`
      <div class="action-card ${isError ? 'error' : ''}">
        <div class="action-header">
          ${tc.status === 'started' 
            ? html`<div class="spinner"></div>` 
            : html`
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${isError ? 'currentColor' : '#10b981'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${isError ? html`<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>` : html`<path d="M20 6 9 17l-5-5"/>`}
                </svg>
              `
          }
          <span style="font-family: monospace; font-weight: 500;">${tc.name}</span>
        </div>
        ${tc.status === 'completed' && tc.result ? html`
          <div style="border-top: 1px solid rgba(128, 128, 128, 0.1); padding: 8px; font-family: monospace; max-height: 80px; overflow-y: auto; white-space: pre-wrap; background: rgba(0,0,0,0.02);">
            ${tc.result}
          </div>
        ` : ''}
      </div>
    `;
  }



  private get isFullscreenLayout() {
    return this.mode === 'fullscreen' || this.mode === 'fullpage';
  }

  private renderSessionButton(session: any) {
    const active = this.conversationId?.toString() === session.id?.toString();
    return html`
      <button class="session-button ${active ? 'active' : ''}" @click=${() => this.switchSession(session.id)} title=${session.title || 'Conversation'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        <span class="session-title">${session.title || 'Conversation'}</span>
      </button>
    `;
  }

  private renderChatSurface() {
    return html`
      ${this.renderHeader()}
      ${this.renderMessages()}
      ${this.renderInput()}
    `;
  }

  private renderHeader() {
    return html`
      <div class="chat-header">
        <chatatp-copilot-avatar .size=${28}></chatatp-copilot-avatar>
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
          <chatatp-history-menu 
            .title=${"New Chat"} 
            .sessions=${this.sessions}
            .activeId=${this.conversationId?.toString() || ''}
            @new-chat=${() => this.startNewChat()}
            @switch-session=${(e: CustomEvent) => this.switchSession(e.detail)}
          ></chatatp-history-menu>
          <div style="font-size: 0.75rem; color: var(--chatatp-muted-foreground, #64748b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.isGenerating ? (this.streamStatus || "Thinking...") : this.statusText}
          </div>
        </div>

        <div class="header-actions">
          <button class="icon-btn" @click=${() => this.startNewChat()} title="New chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
          <button class="icon-btn" @click=${() => this.dispatchEvent(new CustomEvent('switch-mode', { bubbles: true, composed: true }))} title=${this.mode === 'popup' ? 'Switch to sidebar' : 'Switch to popup'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
          </button>
          <chatatp-expand-menu 
            .switchLabel=${this.mode === 'popup' ? "Switch to sidebar" : "Switch to popup"}
            @expand=${() => this.dispatchEvent(new CustomEvent('expand', { bubbles: true, composed: true }))}
            @switch-mode=${() => this.dispatchEvent(new CustomEvent('switch-mode', { bubbles: true, composed: true }))}
          ></chatatp-expand-menu>
          ${!this.isFullscreenLayout ? html`<button class="icon-btn" @click=${() => this.dispatchEvent(new CustomEvent('closeWindow', { bubbles: true, composed: true }))} title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>` : ''}
        </div>
      </div>
    `;
  }

  private renderMessages() {
    return html`
      <div class="messages-area">
        ${this.messages.length === 0 ? html`
          <chatatp-empty-state 
            .variant=${this.mode === 'popup' || this.mode === 'sidebar' ? 'widget' : 'page'}
            .heading=${this.emptyHeading}
            .subheading=${this.emptySubheading}
            .prompts=${this.quickActions.length ? this.quickActions : undefined}
            @select-prompt=${(e: CustomEvent) => this.sendMessage(e.detail.prompt)}
          >
            ${this.quickActions.map((action) => action.iconSlot ? html`<span slot=${action.iconSlot}><slot name=${action.iconSlot}></slot></span>` : '')}
          </chatatp-empty-state>
        ` : ''}

        ${this.messages.map((msg, idx) => html`
          <div class="message-row ${msg.role}">
            <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; align-items: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
              ${msg.role === 'agent' && msg.toolCalls?.length ? html`
                <div style="width: 100%; max-width: 85%;">
                  ${msg.toolCalls.map(tc => this.renderToolCall(tc))}
                </div>
              ` : ''}
              
              ${msg.content ? html`
                <div class="message-bubble">
                  ${msg.role === 'agent' ? this.renderMarkdown(msg.content) : msg.content}
                </div>
              ` : ''}
              
              ${msg.isStreaming && !msg.content && (!msg.toolCalls || msg.toolCalls.length === 0) && idx === this.messages.length - 1 ? html`
                <chatatp-thinking-indicator .label=${this.streamStatus || "Thinking"}></chatatp-thinking-indicator>
              ` : ''}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private renderInput() {
    return html`
      <div class="input-area">
        <div class="input-wrapper">
          <textarea 
            class="input-box" 
            .placeholder=${this.inputPlaceholder}
            .value=${this.inputValue}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            rows="1"
          ></textarea>
          ${this.isGenerating 
            ? html`
              <button class="send-btn stop-btn" @click=${this.stopGeneration} aria-label="Stop Generation">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
              </button>
            `
            : html`
              <button class="send-btn" @click=${() => this.sendMessage()} ?disabled=${!this.inputValue.trim()} aria-label="Send Message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            `
          }
        </div>
      </div>
    `;
  }

  render() {
    if (!this.isFullscreenLayout) {
      return this.renderChatSurface();
    }

    return html`
      <div class="page-shell ${this.historyCollapsed ? 'collapsed' : ''}">
        <aside class="page-sidebar">
          <div class="page-sidebar-header">
            <button class="sidebar-toggle" @click=${() => this.historyCollapsed = !this.historyCollapsed} title="Toggle conversations">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
            </button>
            <button class="sidebar-new-chat" @click=${() => this.startNewChat()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              <span>New chat</span>
            </button>
          </div>
          <div class="page-sessions">
            ${this.sessions.map((session) => this.renderSessionButton(session))}
          </div>
        </aside>
        <main class="page-main">
          ${this.renderChatSurface()}
        </main>
      </div>
    `;
  }
}
