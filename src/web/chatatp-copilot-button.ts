import { LitElement, html, css, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getThemeVariables } from './theme.js';

import './chatatp-chat-interface.js';
import './components/chat-head.js';

@customElement('chatatp-copilot-button')
export class ChatATPCopilotButton extends LitElement {
  @property({ type: String }) agentId = '';
  @property({ type: String }) userId = 'anonymous';
  @property({ type: String }) userDisplayName = 'User';
  @property({ type: String }) mode = 'popup'; // popup, sidebar, fullpage, hidden
  @property({ type: String }) position = 'right'; // left, right
  @property({ type: String }) themePrimary = '#0ea5e9';
  @property({ type: String }) themeSecondary = '#6366f1';
  @property({ type: String }) avatarSrc = '';
  @property({ type: String }) apiKey = '';
  @property({ type: String }) baseUrl = 'http://localhost:8000';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) statusText = 'Ask anything about your agents, platforms or tools.';
  @property({ type: String }) inputPlaceholder = 'Ask the copilot...';
  @property({ type: String }) emptyHeading = 'What are we building today?';
  @property({ type: String }) emptySubheading = 'Ask me anything, or pick a starting point below.';
  @property({ type: Array }) quickActions : any[] = [];
  @property({ type: String, attribute: 'quick-actions-json' }) quickActionsJson = '';
  @property({ type: String }) fullscreenUrl = '';
  @property({ type: String }) sidebarTarget = 'body';

  private previousSidebarPadding: string | null = null;
  private previousSidebarTransition: string | null = null;
  private previousSidebarTarget: HTMLElement | null = null;

  @state() isOpen = false;

  static styles = css`
    :host {
      /* Base host styling will be overwritten by dynamic theme style tag in render */
      display: contents;
      z-index: 2147483645;
    }

    .window-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.12), var(--chatatp-card, #ffffff) 34%);
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      z-index: 2147483646;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 24px 64px rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.24), 0 10px 24px rgba(15, 23, 42, 0.14);
    }
    
    .window-container.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Popup Mode */
    .window-container.popup {
      position: fixed;
      border-radius: 18px;
      width: 420px;
      max-width: 92vw;
      height: 600px;
      max-height: 80vh;
      bottom: 92px;
      transform: translateY(20px) scale(0.95);
    }
    .window-container.popup.right { right: 24px; }
    .window-container.popup.left { left: 24px; }
    
    .window-container.popup.open { transform: translateY(0) scale(1); }

    /* Sidebar Mode */
    .window-container.sidebar {
      top: 0;
      bottom: 0;
      width: 400px;
      max-width: 100vw;
      border-radius: 0;
      transform: translateX(100%);
    }
    .window-container.sidebar.right { right: 0; border-right: none; border-top: none; border-bottom: none; transform: translateX(100%); }
    .window-container.sidebar.left { left: 0; border-left: none; border-top: none; border-bottom: none; transform: translateX(-100%); }
    
    .window-container.sidebar.open { transform: translateX(0); }

    /* Fullscreen/Embedded Mode */
    .window-container.fullscreen {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 500px; /* fallback height */
      border-radius: inherit;
      border: none;
      box-shadow: none;
      transform: none !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    
    .window-container.hidden {
      display: none;
    }
  `;

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if (changedProperties.has('mode')) {
      this.clearSidebarOffset();
    }
    this.syncSidebarOffset();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearSidebarOffset();
  }

  private getResolvedQuickActions() {
    if (this.quickActions?.length) return this.quickActions;
    if (!this.quickActionsJson) return [];
    try {
      const parsed = JSON.parse(this.quickActionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Invalid quick-actions-json for chatatp-copilot-button', error);
      return [];
    }
  }

  private getSidebarElement() {
    return this.sidebarTarget === 'body' ? document.body : document.querySelector(this.sidebarTarget) as HTMLElement | null;
  }

  private openConfiguredMode() {
    if ((this.mode === 'fullscreen' || this.mode === 'fullpage') && this.fullscreenUrl) {
      window.location.assign(this.fullscreenUrl);
      return;
    }
    this.isOpen = true;
  }

  private closePanel() {
    this.isOpen = false;
    this.clearSidebarOffset();
  }

  private syncSidebarOffset() {
    const shouldShift = this.mode === 'sidebar' && this.isOpen;
    const target = this.previousSidebarTarget || this.getSidebarElement();
    if (!target) return;
    if (!shouldShift) {
      this.clearSidebarOffset();
      return;
    }
    const side = this.position === 'left' ? 'paddingLeft' : 'paddingRight';
    if (this.previousSidebarTarget && this.previousSidebarTarget !== target) {
      this.clearSidebarOffset();
    }
    const current = (target.style as any)[side] || '';
    if (this.previousSidebarPadding === null) this.previousSidebarPadding = current;
    if (this.previousSidebarTransition === null) this.previousSidebarTransition = target.style.transition || '';
    this.previousSidebarTarget = target;
    target.style.transition = target.style.transition || 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    (target.style as any)[side] = '400px';
  }

  private clearSidebarOffset() {
    const target = this.previousSidebarTarget || this.getSidebarElement();
    if (!target) return;
    const side = this.position === 'left' ? 'paddingLeft' : 'paddingRight';
    (target.style as any)[side] = this.previousSidebarPadding || '';
    target.style.transition = this.previousSidebarTransition || '';
    this.previousSidebarPadding = null;
    this.previousSidebarTransition = null;
    this.previousSidebarTarget = null;
  }

  render() {
    const themeCSS = getThemeVariables(this.themePrimary, this.themeSecondary);

    const windowClasses = `window-container ${this.mode} ${this.position} ${this.isOpen ? 'open' : ''}`;

    return html`
      <style>
        :host {
          ${unsafeCSS(themeCSS)}
        }
      </style>

      ${!this.isOpen && this.mode !== 'hidden' ? html`
        <chatatp-chat-head
          .enabled=${true}
          .placeholder=${this.placeholder}
          @open-panel=${this.openConfiguredMode}
        ></chatatp-chat-head>
      ` : ''}

      <div class="${windowClasses}">
        <chatatp-chat-interface
          .agentId="${this.agentId}"
          .userId="${this.userId}"
          .userDisplayName="${this.userDisplayName}"
          .apiKey="${this.apiKey}"
          .baseUrl="${this.baseUrl}"
          .mode="${this.mode}"
          .isActive="${this.isOpen}"
          .statusText=${this.statusText}
          .inputPlaceholder=${this.inputPlaceholder}
          .emptyHeading=${this.emptyHeading}
          .emptySubheading=${this.emptySubheading}
          .quickActions=${this.getResolvedQuickActions()}
          @closeWindow="${this.closePanel}"
          @expand="${() => { this.fullscreenUrl ? window.location.assign(this.fullscreenUrl) : this.mode = 'fullscreen'; }}"
          @switch-mode="${() => { this.mode = this.mode === 'popup' ? 'sidebar' : 'popup'; this.isOpen = true; }}"
        >
          ${this.getResolvedQuickActions().map((action) => action.iconSlot ? html`<span slot=${action.iconSlot}><slot name=${action.iconSlot}></slot></span>` : '')}
        </chatatp-chat-interface>
      </div>
    `;
  }
}
