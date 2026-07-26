import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

// Reusable popover logic for Lit
class PopoverBase extends LitElement {
  @state() protected open = false;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('mousedown', this.handleDocClick);
    document.addEventListener('keydown', this.handleEsc);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousedown', this.handleDocClick);
    document.removeEventListener('keydown', this.handleEsc);
  }

  private handleDocClick = (e: MouseEvent) => {
    if (this.open && !this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  private handleEsc = (e: KeyboardEvent) => {
    if (this.open && e.key === 'Escape') {
      this.open = false;
    }
  };

  protected toggleOpen() {
    this.open = !this.open;
  }
}

// ----------------------------------------------------------------------
// Expand Split Menu
// ----------------------------------------------------------------------
@customElement('chatatp-expand-menu')
export class ChatATPExpandMenu extends PopoverBase {
  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
    }
    .split-btn {
      display: flex;
      align-items: center;
      background: transparent;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 6px;
      color: var(--chatatp-foreground, #0f172a);
      transition: background-color 0.2s;
    }
    .btn:hover { background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 1); }
    .btn-primary { width: 24px; border-top-right-radius: 0; border-bottom-right-radius: 0; }
    .btn-chevron { width: 16px; border-top-left-radius: 0; border-bottom-left-radius: 0; }
    
    .popover {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 6px;
      background: var(--chatatp-card, #ffffff);
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50;
      width: 176px;
      padding: 4px 0;
    }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 12px;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--chatatp-foreground, #0f172a);
    }
    .menu-item:hover {
      background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.6);
    }
    .icon { color: var(--chatatp-muted-foreground, #64748b); }
  `;

  @property({ type: String }) switchLabel = "Switch mode";

  render() {
    return html`
      <div class="split-btn">
        <button class="btn btn-primary" title="Expand to fullscreen" @click=${() => this.dispatchEvent(new CustomEvent('expand'))}>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
        </button>
        <button class="btn btn-chevron" title="More layout options" @click=${this.toggleOpen}>
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      
      ${this.open ? html`
        <div class="popover">
          <button class="menu-item" @click=${() => { this.dispatchEvent(new CustomEvent('switch-mode')); this.open = false; }}>
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
            ${this.switchLabel}
          </button>
        </div>
      ` : ''}
    `;
  }
}

// ----------------------------------------------------------------------
// History Menu
// ----------------------------------------------------------------------
@customElement('chatatp-history-menu')
export class ChatATPHistoryMenu extends PopoverBase {
  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      min-width: 0;
    }
    .title-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      max-width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      cursor: pointer;
      border-radius: 6px;
      padding: 2px 4px;
      margin-left: -4px;
      color: var(--chatatp-foreground, #0f172a);
      transition: background-color 0.2s;
    }
    .title-btn:hover { background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.5); }
    .title-text {
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon { color: var(--chatatp-muted-foreground, #64748b); flex-shrink: 0; }
    
    .popover {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 6px;
      background: var(--chatatp-card, #ffffff);
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50;
      width: 288px;
      max-height: 384px;
      display: flex;
      flex-direction: column;
    }
    .popover-header {
      padding: 8px;
      border-bottom: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
    }
    .popover-body {
      flex: 1;
      overflow-y: auto;
    }
    .popover-footer {
      padding: 4px;
      border-top: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
    }
    
    .search-input {
      width: 100%;
      height: 32px;
      padding-left: 32px;
      font-size: 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(var(--chatatp-border-rgb, 226, 232, 240), 1);
      background: transparent;
      color: var(--chatatp-foreground, #0f172a);
      box-sizing: border-box;
    }
    .search-input:focus { outline: none; border-color: var(--chatatp-primary, #0ea5e9); }
    
    .search-icon {
      position: absolute;
      left: 16px;
      top: 18px;
    }

    .group-label {
      padding: 4px 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--chatatp-muted-foreground, #64748b);
    }

    .history-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--chatatp-foreground, #0f172a);
      transition: background-color 0.2s;
    }
    .history-item:hover { background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.6); }
    .history-item.active { background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.4); }
    .history-item .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .history-item .time { font-size: 10px; color: var(--chatatp-muted-foreground, #64748b); margin-left: auto; }

    .new-chat-btn {
      width: 100%;
      text-align: left;
      padding: 6px 8px;
      font-size: 0.75rem;
      border-radius: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--chatatp-muted-foreground, #64748b);
    }
    .new-chat-btn:hover { background-color: rgba(var(--chatatp-muted-rgb, 241, 245, 249), 0.6); }
  `;

  @property({ type: String }) title = "New Chat";
  @property({ type: Array }) sessions : any[] = [];
  @property({ type: String }) activeId = "";
  @state() query = "";

  render() {
    const list = this.query.trim() 
      ? this.sessions.filter(s => s.title?.toLowerCase().includes(this.query.toLowerCase()))
      : this.sessions;

    // Simplified grouping logic for demo
    const today = list.slice(0, 3);
    const older = list.slice(3);

    return html`
      <button class="title-btn" title=${this.title} @click=${this.toggleOpen}>
        <span class="title-text">${this.title}</span>
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      ${this.open ? html`
        <div class="popover">
          <div class="popover-header" style="position: relative;">
            <svg class="icon search-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              class="search-input" 
              placeholder="Search conversations..." 
              .value=${this.query}
              @input=${(e: any) => this.query = e.target.value}
            />
          </div>
          <div class="popover-body">
            ${list.length === 0 ? html`
              <div style="padding: 24px 12px; text-align: center; font-size: 0.75rem; color: var(--chatatp-muted-foreground, #64748b);">
                No conversations found
              </div>
            ` : html`
              ${today.length > 0 ? html`
                <div style="padding: 4px 0;">
                  <div class="group-label">Today</div>
                  ${today.map(s => html`
                    <button class="history-item ${this.activeId === s.id ? 'active' : ''}" @click=${() => { this.dispatchEvent(new CustomEvent('switch-session', { detail: s.id })); this.open = false; }}>
                      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                      <span class="truncate">${s.title}</span>
                    </button>
                  `)}
                </div>
              ` : ''}
              ${older.length > 0 ? html`
                <div style="padding: 4px 0;">
                  <div class="group-label">Older</div>
                  ${older.map(s => html`
                    <button class="history-item ${this.activeId === s.id ? 'active' : ''}" @click=${() => { this.dispatchEvent(new CustomEvent('switch-session', { detail: s.id })); this.open = false; }}>
                      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                      <span class="truncate">${s.title}</span>
                    </button>
                  `)}
                </div>
              ` : ''}
            `}
          </div>
          <div class="popover-footer">
            <button class="new-chat-btn" @click=${() => { this.dispatchEvent(new CustomEvent('new-chat')); this.open = false; }}>
              Start a new conversation
            </button>
          </div>
        </div>
      ` : ''}
    `;
  }
}
