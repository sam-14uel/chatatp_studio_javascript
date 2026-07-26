import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './copilot-avatar.js';

@customElement('chatatp-thinking-indicator')
export class CopilotThinkingIndicator extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .bubble {
      background-color: var(--chatatp-muted, #f1f5f9);
      border-radius: 9999px;
      padding: 8px 14px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      animation: slide-in 0.2s ease-out;
    }
    .dots-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--chatatp-muted-foreground, #64748b);
      opacity: 0.7;
      animation: thinking-dot 1.1s ease-in-out infinite;
    }
    
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(-4px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes thinking-dot {
      0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
      40%           { opacity: 1;    transform: translateY(-2px); }
    }
  `;

  @property({ type: String }) label = "Thinking";

  render() {
    return html`
      <chatatp-copilot-avatar .size=${28} .interactive=${true} .idle=${true}></chatatp-copilot-avatar>
      <div class="bubble">
        <div class="dots-container">
          <span class="dot" style="animation-delay: 0ms"></span>
          <span class="dot" style="animation-delay: 160ms"></span>
          <span class="dot" style="animation-delay: 320ms"></span>
        </div>
      </div>
    `;
  }
}
