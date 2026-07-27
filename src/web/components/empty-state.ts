import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './copilot-avatar.js';

export interface QuickPrompt {
  iconHtml?: string;
  iconSlot?: string;
  title: string;
  subtitle: string;
  prompt: string;
}

const DEFAULT_PROMPTS: QuickPrompt[] = [
  {
    iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
    title: "Build an AI Agent",
    subtitle: "Create and configure a new agent",
    prompt: "Help me build a new AI agent. Guide me through creating it, choosing a model, adding capabilities, and preparing it for deployment.",
  },
  {
    iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>`,
    title: "Connect Integrations",
    subtitle: "Platforms, MCP servers & APIs",
    prompt: "Help me connect platforms, MCP servers, or HTTP API tools to my agent and explain which option is best for my use case.",
  },
  {
    iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    title: "Configure My Agent",
    subtitle: "Models, memory & knowledge",
    prompt: "Help me configure my agent by selecting the best AI model, attaching knowledge bases, memory, tools, and integrations.",
  },
  {
    iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    title: "What Can I Build?",
    subtitle: "Discover ideas for AI automation",
    prompt: "Show me practical AI agents and automations I can build with ChatATP Studio based on the platform's capabilities.",
  }
];

@customElement('chatatp-empty-state')
export class ChatATPEmptyState extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 24px;
      text-align: center;
      box-sizing: border-box;
      width: 100%;
    }
    
    .variant-page {
      justify-content: center;
      height: 100%;
      padding-top: 32px;
      padding-bottom: 32px;
    }
    
    .variant-widget {
      justify-content: flex-start;
      padding-top: 40px;
      padding-bottom: 24px;
    }

    .avatar-wrapper {
      padding: 12px;
      margin-bottom: 4px;
    }

    h3 {
      font-weight: 600;
      margin-top: 4px;
      margin-bottom: 0;
      color: var(--chatatp-foreground, #0f172a);
    }
    .variant-page h3 { font-size: 1.125rem; }
    .variant-widget h3 { font-size: 1rem; }

    p {
      font-size: 0.875rem;
      color: var(--chatatp-muted-foreground, #64748b);
      margin-top: 4px;
      margin-bottom: 24px;
      max-width: 320px;
    }

    .prompts-grid {
      display: grid;
      gap: 10px;
      width: 100%;
    }
    .variant-page .prompts-grid {
      max-width: 512px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .variant-widget .prompts-grid {
      grid-template-columns: 1fr;
    }

    .prompt-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      border-radius: 12px;
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      background: linear-gradient(135deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.10), rgba(var(--chatatp-card-rgb, 255, 255, 255), 0.82));
      padding: 12px;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
      outline: none;
    }

    .prompt-card:hover {
      border-color: rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.4);
      background-color: rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.05);
    }

    .icon-wrapper {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background-color: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.16);
      color: var(--chatatp-primary, #0ea5e9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background-color 0.2s;
    }

    .prompt-card:hover .icon-wrapper {
      background-color: rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.18);
    }

    .text-wrapper {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--chatatp-foreground, #0f172a);
    }

    .subtitle {
      font-size: 0.75rem;
      color: var(--chatatp-muted-foreground, #64748b);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;

  @property({ type: String }) variant : 'page' | 'widget' = 'page';
  @property({ type: Array }) prompts : QuickPrompt[] = DEFAULT_PROMPTS;
  @property({ type: String }) heading = 'What are we building today?';
  @property({ type: String }) subheading = 'Ask me anything, or pick a starting point below.';

  private handleSelect(prompt: string) {
    this.dispatchEvent(new CustomEvent('select-prompt', { detail: { prompt } }));
  }

  // Use Lit's unsafeHTML safely since we're providing static SVG strings, 
  // but since we want to avoid bringing in unsafeHTML directive for bundle size, we can just use innerHTML on a wrapper.
  render() {
    return html`
      <div class="variant-${this.variant}" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div class="avatar-wrapper">
          <chatatp-copilot-avatar 
            .size=${this.variant === 'page' ? 72 : 52} 
            .idle=${true} 
            .interactive=${true} 
            .ambient=${{ fire: true, bubbles: true, restMs: 7000 }}
          ></chatatp-copilot-avatar>
        </div>
        
        <h3>${this.heading}</h3>
        <p>${this.subheading}</p>

        <div class="prompts-grid">
          ${this.prompts.map(p => html`
            <button class="prompt-card" @click=${() => this.handleSelect(p.prompt)}>
              <div class="icon-wrapper">
                ${p.iconSlot ? html`<slot name=${p.iconSlot}></slot>` : html`<span .innerHTML=${p.iconHtml || ''}></span>`}
              </div>
              <div class="text-wrapper">
                <div class="title">${p.title}</div>
                <div class="subtitle">${p.subtitle}</div>
              </div>
            </button>
          `)}
        </div>
      </div>
    `;
  }
}
