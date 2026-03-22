import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { isWhiteColor } from '../../utils/color.js';

export class ClosetItem extends LitElement {
  static properties = {
    categoryName: { type: String, attribute: 'category-name' },
    colorName: { type: String, attribute: 'color-name' },
    colorHex: { type: String, attribute: 'color-hex' },
    itemId: { type: String, attribute: 'item-id' },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .item {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-4);
        display: flex;
        align-items: center;
        box-shadow: var(--dc-shadow-ambient);
        transition: transform 0.2s;
      }
      .item:active { transform: scale(0.98); }

      .color-dot {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: var(--dc-radius-full);
        margin-right: var(--dc-space-4);
        flex-shrink: 0;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
      }
      .color-dot.white {
        border: 1px solid var(--dc-outline-variant);
        box-shadow: none;
      }

      .info { flex: 1; }

      .name {
        font-size: var(--dc-font-body);
        font-weight: 700;
        color: var(--dc-text);
      }

      .color-label {
        font-size: var(--dc-font-caption);
        color: var(--dc-text-secondary);
      }

      .delete-btn {
        color: var(--dc-outline);
        padding: var(--dc-space-1);
        border-radius: var(--dc-radius-full);
        transition: color 0.2s;
      }
      .delete-btn:hover { color: var(--dc-danger); }
      .delete-btn .material-symbols-outlined { font-size: 1.25rem; }
    `,
  ];

  constructor() {
    super();
    this.categoryName = '';
    this.colorName = '';
    this.colorHex = '#333333';
    this.itemId = '';
  }

  #handleDelete() {
    this.dispatchEvent(new CustomEvent('dc-delete', {
      detail: { id: this.itemId },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const isWhite = isWhiteColor(this.colorHex);
    return html`
      <div class="item">
        <div class="color-dot ${isWhite ? 'white' : ''}" style="background: ${this.colorHex}"></div>
        <div class="info">
          <p class="name">${this.categoryName}</p>
          <p class="color-label">${this.colorName}</p>
        </div>
        <button class="delete-btn" @click=${this.#handleDelete}>
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }
}

customElements.define('closet-item', ClosetItem);
