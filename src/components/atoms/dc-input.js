import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

export class DcInput extends LitElement {
  static properties = {
    type: { type: String },
    label: { type: String },
    placeholder: { type: String },
    value: { type: String },
    error: { type: String },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host {
        display: block;
      }

      label {
        display: block;
        font-size: var(--dc-font-caption);
        font-weight: 500;
        color: var(--dc-text-secondary);
        margin-bottom: var(--dc-space-2);
        padding-left: var(--dc-space-1);
      }

      input {
        width: 100%;
        height: var(--dc-input-height);
        padding: 0 var(--dc-space-4);
        border: none;
        border-radius: var(--dc-radius-sm);
        font-size: 0.9375rem;
        font-family: var(--dc-font-family);
        background: var(--dc-surface-low);
        color: var(--dc-text);
        transition: background 0.2s, box-shadow 0.2s;
      }

      input::placeholder {
        color: var(--dc-outline);
        opacity: 0.6;
      }

      input:focus {
        outline: none;
        background: var(--dc-surface-high);
        box-shadow: 0 0 0 2px rgba(0, 94, 161, 0.2);
      }

      input.has-error {
        box-shadow: 0 0 0 2px rgba(186, 26, 26, 0.2);
      }

      .error-msg {
        font-size: var(--dc-font-caption);
        color: var(--dc-danger);
        margin-top: var(--dc-space-1);
        padding-left: var(--dc-space-1);
      }
    `,
  ];

  constructor() {
    super();
    this.type = 'text';
    this.label = '';
    this.placeholder = '';
    this.value = '';
    this.error = '';
  }

  #handleInput(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('dc-input', { detail: this.value, bubbles: true, composed: true }));
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ''}
      <input
        type=${this.type}
        placeholder=${this.placeholder}
        .value=${this.value}
        class=${this.error ? 'has-error' : ''}
        @input=${this.#handleInput}
      />
      ${this.error ? html`<div class="error-msg">${this.error}</div>` : ''}
    `;
  }
}

customElements.define('dc-input', DcInput);
