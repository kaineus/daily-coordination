import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';

export class TypingIndicator extends LitElement {
  static styles = [
    tokens,
    css`
      :host { display: block; }

      .container {
        display: inline-flex;
        align-items: center;
        gap: var(--dc-space-2);
        padding: var(--dc-space-4) var(--dc-space-5);
        background: var(--dc-surface-lowest);
        border-radius: 1rem;
        border-bottom-left-radius: 0.25rem;
        box-shadow: 0px 4px 12px rgba(26, 28, 31, 0.04);
      }

      .avatar {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        background: var(--dc-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .avatar-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 1rem;
        color: var(--dc-primary);
      }

      .dots {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        height: 1.25rem;
      }

      .dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--dc-outline);
        animation: typing 1.4s infinite;
      }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typing {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-4px); }
      }
    `,
  ];

  render() {
    return html`
      <div class="container">
        <div class="avatar">
          <span class="avatar-icon">auto_awesome</span>
        </div>
        <div class="dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    `;
  }
}

customElements.define('typing-indicator', TypingIndicator);
