import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';

export class DcSpinner extends LitElement {
  static properties = {
    size: { type: String },
  };

  static styles = [
    tokens,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        border: 2px solid var(--dc-outline-variant);
        border-top-color: var(--dc-primary);
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  constructor() {
    super();
    this.size = '1.5';
  }

  render() {
    return html`<div
      class="spinner"
      style="width: ${this.size}rem; height: ${this.size}rem"
    ></div>`;
  }
}

customElements.define('dc-spinner', DcSpinner);
