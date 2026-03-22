import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

export class OutfitCard extends LitElement {
  static properties = {
    items: { type: Array },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host { display: block; }

      .card {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-5);
        box-shadow: var(--dc-shadow-ambient);
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-4);
      }

      .item {
        display: flex;
        gap: var(--dc-space-5);
        padding: var(--dc-space-4);
        border-radius: var(--dc-radius-sm);
        transition: background 0.3s;
      }
      .item:hover { background: var(--dc-surface-low); }

      .item-icon {
        width: 4rem;
        height: 4rem;
        background: var(--dc-surface-high);
        border-radius: var(--dc-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .item-icon .material-symbols-outlined {
        font-size: 2rem;
        color: var(--dc-outline);
      }

      .item-content { flex: 1; }

      .category-label {
        font-size: var(--dc-font-caption);
        font-weight: 500;
        color: var(--dc-primary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: var(--dc-space-1);
      }

      .item-name {
        font-size: var(--dc-font-title);
        font-weight: 600;
        color: var(--dc-text);
      }

      .color-info {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
        margin-top: var(--dc-space-1);
      }
      .color-dot {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: var(--dc-radius-full);
      }
      .color-dot.white { border: 1px solid var(--dc-outline-variant); }
      .color-name {
        font-size: 0.8125rem;
        color: var(--dc-outline);
      }

      .reason {
        font-size: var(--dc-font-body);
        color: var(--dc-text-secondary);
        margin-top: var(--dc-space-2);
        line-height: 1.6;
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
  }

  render() {
    const ICONS = { '아우터': 'apparel', '상의': 'dry_cleaning', '하의': 'checkroom', '신발': 'step_into' };

    return html`
      <div class="card">
        ${this.items.map(item => {
          const isWhite = item.colorHex?.toLowerCase() === '#ffffff';
          return html`
            <div class="item">
              <div class="item-icon">
                <span class="material-symbols-outlined">${ICONS[item.category] ?? 'checkroom'}</span>
              </div>
              <div class="item-content">
                <p class="category-label">${item.category}</p>
                <h4 class="item-name">${item.name}</h4>
                <div class="color-info">
                  <div class="color-dot ${isWhite ? 'white' : ''}" style="background: ${item.colorHex}"></div>
                  <span class="color-name">${item.colorName}</span>
                </div>
                ${item.reason ? html`<p class="reason">${item.reason}</p>` : ''}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('outfit-card', OutfitCard);
