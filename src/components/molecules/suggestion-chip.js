import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';

export class SuggestionChip extends LitElement {
  static properties = {
    label: { type: String },
  };

  static styles = [
    tokens,
    css`
      :host { display: inline-block; }

      button {
        display: inline-flex;
        align-items: center;
        gap: var(--dc-space-1);
        padding: var(--dc-space-2) var(--dc-space-3);
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-body);
        font-weight: 500;
        color: var(--dc-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0px 2px 8px rgba(26, 28, 31, 0.04);
        white-space: nowrap;
      }

      button:hover,
      button:active {
        background: var(--dc-primary-light);
        color: var(--dc-primary-hover);
      }

      button:active {
        transform: scale(0.97);
      }
    `,
  ];

  render() {
    return html`
      <button @click=${this.#handleClick}>${this.label}</button>
    `;
  }

  #handleClick() {
    this.dispatchEvent(new CustomEvent('dc-suggestion-select', {
      detail: { label: this.label },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('suggestion-chip', SuggestionChip);
