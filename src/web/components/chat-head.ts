import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './copilot-avatar.js';

@customElement('chatatp-chat-head')
export class ChatATPChatHead extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
    }
    
    .launcher-btn {
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: linear-gradient(135deg, var(--chatatp-primary, #0ea5e9), var(--chatatp-secondary, #6366f1));
      cursor: pointer;
      padding: 0;
      transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
      border-radius: 27px;
    }
    
    .launcher-btn.with-text {
      background: linear-gradient(135deg, rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.18), rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.10)), color-mix(in srgb, var(--chatatp-secondary) 7%, #ffffff);
      border: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.35);
      padding: 4px 20px 4px 4px;
      gap: 12px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .launcher-btn.with-text:hover {
      background: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.18);
    }
    
    .launcher-btn:hover {
      transform: scale(1.05);
    }
    
    .launcher-btn:active {
      transform: scale(0.95);
    }
    
    .avatar-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
    }
    
    .avatar-inner {
      position: relative;
      border-radius: 50%;
      padding: 2px;
      background: linear-gradient(135deg, var(--chatatp-primary, #0ea5e9), var(--chatatp-secondary, #6366f1));
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 2px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.35);
    }
    
    .launcher-btn.with-text .avatar-inner {
      box-shadow: none;
      border: none;
      background: transparent;
      padding: 0;
    }
    
    .placeholder-text {
      font-family: var(--chatatp-font, 'Inter', system-ui, sans-serif);
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--chatatp-foreground, #0f172a);
      white-space: nowrap;
    }

    @keyframes attention-glow {
      0%   { transform: scale(0.75); opacity: 0; }
      25%  { opacity: 0.35; }
      100% { transform: scale(1.65); opacity: 0; }
    }
    
    .attention-glow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0.35) 0%, rgba(var(--chatatp-primary-rgb, 14, 165, 233), 0) 70%);
      animation: attention-glow 1.8s ease-out forwards;
    }
  `;

  @property({ type: Boolean }) enabled = true;
  @property({ type: Boolean }) hasInteracted = false;
  @property({ type: String }) placeholder = '';
  
  @state() rings : number[] = [];
  
  private ringId = 0;
  private timeouts: number[] = [];
  private scheduleTimeout?: number;

  connectedCallback() {
    super.connectedCallback();
    this.startPulse();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearAll();
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('enabled') || changedProps.has('hasInteracted')) {
      if (!this.enabled || this.hasInteracted) {
        this.clearAll();
      } else {
        this.startPulse();
      }
    }
  }

  private clearAll() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
    if (this.scheduleTimeout) {
      clearTimeout(this.scheduleTimeout);
      this.scheduleTimeout = undefined;
    }
    this.rings = [];
  }

  private addTimeout(fn: () => void, delay: number) {
    const id = window.setTimeout(fn, delay);
    this.timeouts.push(id);
    return id;
  }

  private startPulse() {
    this.clearAll();
    if (!this.enabled || this.hasInteracted) return;

    const minIdle = 9000;
    const maxIdle = 15000;
    const ringsPerBurst = 2;
    const ringSpacing = 260;
    const ringDuration = 1400;

    const fireBurst = () => {
      for (let i = 0; i < ringsPerBurst; i++) {
        this.addTimeout(() => {
          const id = ++this.ringId;
          this.rings = [...this.rings, id];
          this.addTimeout(() => {
            this.rings = this.rings.filter(r => r !== id);
          }, ringDuration);
        }, i * ringSpacing);
      }
    };

    const scheduleNext = () => {
      const delay = minIdle + Math.random() * (maxIdle - minIdle);
      this.scheduleTimeout = window.setTimeout(() => {
        fireBurst();
        scheduleNext();
      }, delay);
    };

    this.scheduleTimeout = window.setTimeout(() => {
      fireBurst();
      scheduleNext();
    }, 2500);
  }

  private stopPulse() {
    this.hasInteracted = true;
    this.clearAll();
  }

  private handleOpen() {
    this.stopPulse();
    this.dispatchEvent(new CustomEvent('open-panel', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <button
        class="launcher-btn ${this.placeholder ? 'with-text' : ''}"
        @click=${this.handleOpen}
        @mouseenter=${this.stopPulse}
        aria-label="Open Copilot"
      >
        <div class="avatar-wrapper">
          ${this.rings.map(id => html`<span class="attention-glow" key=${id}></span>`)}
          <div class="avatar-inner">
            <chatatp-copilot-avatar 
              .size=${48} 
              .interactive=${true} 
              .waveSignal=${this.rings.length > 0 ? this.rings[0] : 0}
            ></chatatp-copilot-avatar>
          </div>
        </div>
        ${this.placeholder ? html`<span class="placeholder-text">${this.placeholder}</span>` : ''}
      </button>
    `;
  }
}
