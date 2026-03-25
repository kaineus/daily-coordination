import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { bp } from '../../styles/breakpoints.css.js';

const QUICK_SUGGESTIONS = [
  '"검정 패딩"',
  '"베이지 니트"',
  '"네이비 슬랙스"',
  '"흰색 셔츠"',
  '"회색 운동화"',
];

export class ChatInputBar extends LitElement {
  static properties = {
    disabled: { type: Boolean },
    _value: { state: true },
  };

  static styles = [
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .bar {
        padding: var(--dc-space-3) var(--dc-space-4);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
      }

      .input-row {
        display: flex;
        align-items: flex-end;
        gap: var(--dc-space-2);
      }

      .input-wrap {
        flex: 1;
        min-width: 0;
      }

      textarea {
        display: block;
        width: 100%;
        min-height: 2.75rem;
        max-height: 7rem;
        padding: var(--dc-space-3) var(--dc-space-4);
        background: var(--dc-surface-low);
        border: none;
        border-radius: 1rem;
        font-family: inherit;
        font-size: var(--dc-font-body);
        color: var(--dc-text);
        resize: none;
        outline: none;
        line-height: 1.5;
      }

      textarea::placeholder {
        color: var(--dc-outline);
      }

      .send-btn {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 50%;
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0, 94, 161, 0.2);
      }

      .send-btn:active { transform: scale(0.9); }
      .send-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      .send-btn .material-symbols-outlined { font-size: 1.25rem; }

      .quick-chips {
        display: flex;
        gap: var(--dc-space-2);
        margin-top: var(--dc-space-2);
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .quick-chips::-webkit-scrollbar { display: none; }

      .quick-chip {
        flex-shrink: 0;
        padding: var(--dc-space-1) var(--dc-space-3);
        background: var(--dc-surface-low);
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-caption);
        font-weight: 500;
        color: var(--dc-text-secondary);
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;
      }
      .quick-chip:active { transform: scale(0.95); }

      @media (min-width: ${bp.lg}) {
        .bar {
          padding: var(--dc-space-4) var(--dc-space-6);
          background: var(--dc-surface-lowest);
          backdrop-filter: none;
          border-top: 1px solid rgba(193, 199, 210, 0.2);
        }
      }
    `,
  ];

  constructor() {
    super();
    this.disabled = false;
    this._value = '';
  }

  render() {
    return html`
      <div class="bar">
        <div class="input-row">
          <div class="input-wrap">
            <textarea
              rows="1"
              placeholder="옷을 알려주세요..."
              .value=${this._value}
              ?disabled=${this.disabled}
              @input=${this.#handleInput}
              @keydown=${this.#handleKeydown}
            ></textarea>
          </div>
          <button
            class="send-btn"
            ?disabled=${this.disabled || !this._value.trim()}
            @click=${this.#send}
          >
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
        <div class="quick-chips">
          ${QUICK_SUGGESTIONS.map((s) => html`
            <button class="quick-chip" @click=${() => this.#quickSend(s)}>${s}</button>
          `)}
        </div>
      </div>
    `;
  }

  #handleInput(e) {
    this._value = e.target.value;
    // 자동 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
  }

  #handleKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.#send();
    }
  }

  #send() {
    const text = this._value.trim();
    if (!text || this.disabled) return;
    this.dispatchEvent(new CustomEvent('dc-chat-send', {
      detail: { text },
      bubbles: true,
      composed: true,
    }));
    this._value = '';
    const ta = this.shadowRoot.querySelector('textarea');
    if (ta) ta.style.height = 'auto';
  }

  #quickSend(suggestion) {
    // 따옴표 제거
    const text = suggestion.replace(/"/g, '');
    this.dispatchEvent(new CustomEvent('dc-chat-send', {
      detail: { text },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('chat-input-bar', ChatInputBar);
