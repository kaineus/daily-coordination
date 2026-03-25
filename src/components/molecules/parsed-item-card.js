import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';

export class ParsedItemCard extends LitElement {
  static properties = {
    categoryIcon: { type: String, attribute: 'category-icon' },
    categoryName: { type: String, attribute: 'category-name' },
    colorName: { type: String, attribute: 'color-name' },
    colorHex: { type: String, attribute: 'color-hex' },
    checked: { type: Boolean },
  };

  static styles = [
    tokens,
    css`
      :host { display: block; }

      .card {
        display: flex;
        align-items: center;
        gap: var(--dc-space-3);
        padding: var(--dc-space-3) var(--dc-space-4);
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-md);
        box-shadow: 0px 4px 12px rgba(26, 28, 31, 0.04);
      }

      .icon-box {
        width: 2.5rem;
        height: 2.5rem;
        background: var(--dc-surface-low);
        border-radius: var(--dc-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .info {
        flex: 1;
        min-width: 0;
      }

      .category-name {
        font-size: var(--dc-font-body);
        font-weight: 600;
        color: var(--dc-text);
      }

      .color-row {
        display: flex;
        align-items: center;
        gap: var(--dc-space-1);
        margin-top: 0.125rem;
      }

      .color-dot {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .color-name {
        font-size: var(--dc-font-caption);
        color: var(--dc-text-secondary);
      }

      .check {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .check-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 0.875rem;
        color: var(--dc-success);
      }
    `,
  ];

  render() {
    return html`
      <div class="card">
        <div class="icon-box">${this.categoryIcon}</div>
        <div class="info">
          <div class="category-name">${this.categoryName}</div>
          <div class="color-row">
            <span class="color-dot" style="background: ${this.colorHex}"></span>
            <span class="color-name">${this.colorName}</span>
          </div>
        </div>
        ${this.checked ? html`
          <div class="check">
            <span class="check-icon">check</span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('parsed-item-card', ParsedItemCard);
