import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { bp } from '../../styles/breakpoints.css.js';

export class ChatMessage extends LitElement {
  static properties = {
    role: { type: String },       // 'user' | 'assistant'
    content: { type: String },
    timestamp: { type: String },
  };

  static styles = [
    tokens,
    css`
      :host { display: block; }

      .row {
        display: flex;
        gap: var(--dc-space-2);
        max-width: 90%;
      }

      .row.user {
        margin-left: auto;
        justify-content: flex-end;
        max-width: 75%;
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
        margin-top: 0.125rem;
      }

      .avatar-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 1rem;
        color: var(--dc-primary);
      }

      .bubble {
        padding: var(--dc-space-3) var(--dc-space-4);
        font-size: var(--dc-font-body);
        line-height: 1.6;
        word-break: break-word;
      }

      .bubble.assistant {
        background: var(--dc-surface-lowest);
        color: var(--dc-text);
        border-radius: 1rem;
        border-bottom-left-radius: 0.25rem;
        box-shadow: 0px 4px 12px rgba(26, 28, 31, 0.04);
      }

      .bubble.user {
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        border-radius: 1rem;
        border-bottom-right-radius: 0.25rem;
      }

      .time {
        font-size: var(--dc-font-tiny);
        margin-top: var(--dc-space-1);
      }

      .time.assistant { color: var(--dc-outline); }
      .time.user { color: rgba(255, 255, 255, 0.6); text-align: right; }

      @media (min-width: ${bp.lg}) {
        .row { max-width: 80%; }
        .row.user { max-width: 65%; }
      }
    `,
  ];

  render() {
    const isUser = this.role === 'user';

    if (isUser) {
      return html`
        <div class="row user">
          <div>
            <div class="bubble user">${this.content}</div>
            ${this.timestamp ? html`<div class="time user">${this.timestamp}</div>` : ''}
          </div>
        </div>
      `;
    }

    return html`
      <div class="row">
        <div class="avatar">
          <span class="avatar-icon">auto_awesome</span>
        </div>
        <div>
          <div class="bubble assistant">${this.content}</div>
          ${this.timestamp ? html`<div class="time assistant">${this.timestamp}</div>` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('chat-message', ChatMessage);
