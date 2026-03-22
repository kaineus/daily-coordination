import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { CATEGORY_COLORS } from '../../constants/clothing.js';

export class DcChip extends LitElement {
  static properties = {
    label: { type: String },
    icon: { type: String },
    selected: { type: Boolean, reflect: true },
    category: { type: String },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: inline-block; }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        height: 2rem;
        padding: 0 0.75rem;
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-caption);
        font-family: var(--dc-font-family);
        cursor: pointer;
        transition: all 0.2s;
        background: var(--dc-surface-high);
        color: var(--dc-text-secondary);
      }

      button:hover { filter: brightness(0.97); }

      button.selected { font-weight: 700; }

      .material-symbols-outlined { font-size: 1rem; }
    `,
  ];

  constructor() {
    super();
    this.label = '';
    this.icon = '';
    this.selected = false;
    this.category = '';
  }

  #handleClick() {
    this.dispatchEvent(new CustomEvent('dc-chip-click', {
      detail: { label: this.label, selected: !this.selected },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const cat = CATEGORY_COLORS[this.category];
    const style = this.selected && cat
      ? `background: ${cat.bg}; color: ${cat.color}`
      : '';
    const fill = this.selected ? "'FILL' 1" : "'FILL' 0";

    return html`
      <button class=${this.selected ? 'selected' : ''} style=${style} @click=${this.#handleClick}>
        ${this.icon
          ? html`<span class="material-symbols-outlined" style="font-variation-settings: ${fill}">${this.icon}</span>`
          : ''}
        ${this.label}
      </button>
    `;
  }
}

customElements.define('dc-chip', DcChip);
