import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import '../atoms/dc-button.js';

export class EmptyState extends LitElement {
  static properties = {
    icon: { type: String },
    title: { type: String },
    description: { type: String },
    buttonText: { type: String, attribute: 'button-text' },
    buttonHref: { type: String, attribute: 'button-href' },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .container {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-12);
        box-shadow: var(--dc-shadow-ambient);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .icon-wrap {
        width: 5rem;
        height: 5rem;
        background: var(--dc-surface-low);
        border-radius: var(--dc-radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--dc-space-6);
      }
      .icon-wrap .material-symbols-outlined {
        font-size: 3rem;
        color: var(--dc-primary);
        opacity: 0.4;
      }

      h3 {
        font-size: var(--dc-font-h2);
        font-weight: 700;
        color: var(--dc-text);
        margin-bottom: var(--dc-space-2);
        letter-spacing: -0.02em;
      }

      p {
        font-size: var(--dc-font-body);
        color: var(--dc-text-secondary);
        max-width: 20rem;
        margin-bottom: var(--dc-space-8);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
    this.icon = 'checkroom';
    this.title = '';
    this.description = '';
    this.buttonText = '';
    this.buttonHref = '';
  }

  #handleClick() {
    if (this.buttonHref) {
      this.dispatchEvent(new CustomEvent('dc-navigate', {
        detail: { href: this.buttonHref },
        bubbles: true, composed: true,
      }));
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="icon-wrap">
          <span class="material-symbols-outlined">${this.icon}</span>
        </div>
        <h3>${this.title}</h3>
        <p>${this.description}</p>
        ${this.buttonText ? html`
          <dc-button variant="primary" @click=${this.#handleClick}>${this.buttonText}</dc-button>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('empty-state', EmptyState);
