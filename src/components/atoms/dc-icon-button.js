import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';

export class DcIconButton extends LitElement {
  static properties = {
    icon: { type: String },
    variant: { type: String },
  };

  static styles = [
    tokens,
    css`
      :host { display: inline-block; }

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--dc-radius-full);
        border: none;
        background: var(--dc-surface-high);
        color: var(--dc-text);
        cursor: pointer;
        transition: all 0.2s;
      }

      button:hover { background: var(--dc-surface-container); }

      button.danger:hover {
        background: var(--dc-error-container);
        color: var(--dc-danger);
      }

      .material-symbols-outlined { font-size: 1.25rem; }
    `,
  ];

  constructor() {
    super();
    this.icon = 'close';
    this.variant = 'default';
  }

  render() {
    return html`
      <button class=${this.variant}>
        <span class="material-symbols-outlined">${this.icon}</span>
      </button>
    `;
  }
}

customElements.define('dc-icon-button', DcIconButton);
