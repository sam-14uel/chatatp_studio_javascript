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

  @state() isOpen = false;

  static styles = css`
    :host {
      /* Base host styling will be overwritten by dynamic theme style tag in render */
      display: block;
      z-index: 9999;
      width: 100%;
      height: 100%;
    }

    .window-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      background-color: var(--chatatp-card, #ffffff);
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      z-index: 10000;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .window-container.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Popup Mode */
    .window-container.popup {
      border-radius: 16px;
      width: 420px;
      max-width: 92vw;
      height: 600px;
      max-height: 80vh;
      bottom: 90px;
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
      if (this.mode === 'sidebar' || this.mode === 'fullscreen' || this.mode === 'fullpage') {
        this.isOpen = true;
      }
    }
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

      ${!this.isOpen && this.mode === 'popup' ? html`
        <chatatp-chat-head
          .enabled=${true}
          .placeholder=${this.placeholder}
          @open-panel=${() => this.isOpen = true}
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
          @closeWindow="${() => this.isOpen = false}"
          @expand="${() => { this.mode = 'fullscreen'; }}"
          @switch-mode="${() => { this.mode = this.mode === 'popup' ? 'sidebar' : 'popup'; }}"
        ></chatatp-chat-interface>
      </div>
    `;
  }
}
