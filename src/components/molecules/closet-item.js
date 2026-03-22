import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import '../atoms/dc-icon-button.js';

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
    css`
      :host { display: block; }

      .item {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-md);
        padding: var(--dc-space-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: transform 0.3s;
      }
      .item:hover { transform: translateX(0.25rem); }

      .info {
        display: flex;
        align-items: center;
        gap: var(--dc-space-4);
      }

      .color-dot {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: var(--dc-radius-full);
      }
      .color-dot.white { border: 1px solid var(--dc-outline-variant); }

      .name {
        font-weight: 600;
        color: var(--dc-text);
      }

      .separator {
        margin: 0 var(--dc-space-2);
        color: var(--dc-outline-variant);
      }

      .color-label {
        color: var(--dc-text-secondary);
      }
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
    const isWhite = this.colorHex.toLowerCase() === '#ffffff';
    return html`
      <div class="item">
        <div class="info">
          <div class="color-dot ${isWhite ? 'white' : ''}" style="background: ${this.colorHex}"></div>
          <div>
            <span class="name">${this.categoryName}</span>
            <span class="separator">/</span>
            <span class="color-label">${this.colorName}</span>
          </div>
        </div>
        <dc-icon-button icon="delete" variant="danger" @click=${this.#handleDelete}></dc-icon-button>
      </div>
    `;
  }
}

customElements.define('closet-item', ClosetItem);
