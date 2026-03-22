import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

export class DcButton extends LitElement {
  static properties = {
    variant: { type: String },
    disabled: { type: Boolean, reflect: true },
    loading: { type: Boolean },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host {
        display: inline-block;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--dc-space-2);
        width: 100%;
        padding: var(--dc-space-3) var(--dc-space-6);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-title);
        font-weight: 500;
        transition: all 0.2s;
        min-height: var(--dc-button-min-height);
      }

      button:active:not(:disabled) {
        transform: scale(0.98);
      }

      button.primary {
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        box-shadow: var(--dc-shadow-primary);
      }
      button.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      button.secondary {
        background: transparent;
        color: var(--dc-primary);
        border: 1.5px solid var(--dc-primary);
      }
      button.secondary:hover:not(:disabled) {
        background: rgba(0, 94, 161, 0.08);
      }

      button.text {
        background: transparent;
        color: var(--dc-primary);
      }
      button.text:hover:not(:disabled) {
        background: var(--dc-surface-high);
      }

      button.accent {
        background: var(--dc-secondary);
        color: white;
      }
      button.accent:hover:not(:disabled) {
        filter: brightness(1.1);
      }

      button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'primary';
    this.disabled = false;
    this.loading = false;
  }

  render() {
    return html`
      <button
        class=${this.variant}
        ?disabled=${this.disabled || this.loading}
      >
        ${this.loading ? html`<dc-spinner size="1"></dc-spinner>` : ''}
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('dc-button', DcButton);
