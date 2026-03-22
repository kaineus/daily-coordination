import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { TYPE_EMOJI, TYPE_MATERIAL_ICONS } from '../../constants/clothing.js';
import { isWhiteColor } from '../../utils/color.js';

export class OutfitCard extends LitElement {
  static properties = {
    items: { type: Array },
    summary: { type: String },
    tip: { type: String },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: block; }

      .card {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg);
        padding: var(--dc-space-5);
        box-shadow: var(--dc-shadow-ambient);
        border: 1px solid rgba(193, 199, 210, 0.1);
      }

      .summary {
        font-family: var(--dc-font-headline);
        font-size: 1.0625rem;
        font-weight: 600;
        color: var(--dc-text);
        line-height: 1.4;
        margin-bottom: var(--dc-space-4);
      }

      .palette {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--dc-space-4);
      }
      .palette-dots {
        display: flex;
        gap: 0.375rem;
      }
      .palette-dot {
        width: 0.75rem;
        height: 0.75rem;
        border-radius: var(--dc-radius-full);
      }
      .palette-dot.white { border: 1px solid var(--dc-outline-variant); }

      /* Mobile: 4-col icon grid */
      .icon-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--dc-space-2);
        margin-bottom: var(--dc-space-6);
      }
      .icon-cell {
        background: var(--dc-surface-low);
        border-radius: var(--dc-radius-md);
        padding: var(--dc-space-3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--dc-space-2);
        aspect-ratio: 1;
        justify-content: center;
      }
      .icon-cell .material-symbols-outlined {
        font-size: 1.5rem;
        color: var(--dc-text-secondary);
      }
      .icon-cell span:last-child {
        font-size: var(--dc-font-tiny);
        font-weight: 500;
        color: var(--dc-text-secondary);
      }

      /* Desktop: detail list (hidden on mobile) */
      .detail-grid {
        display: none;
      }

      .tip-box {
        background: rgba(0, 94, 161, 0.05);
        border-radius: var(--dc-radius-md);
        padding: var(--dc-space-4);
        margin-bottom: var(--dc-space-6);
        border: 1px solid rgba(0, 94, 161, 0.1);
        display: flex;
        gap: var(--dc-space-2);
        font-size: 0.8125rem;
        color: var(--dc-text-secondary);
        line-height: 1.6;
      }

      .refresh-btn {
        width: 100%;
        height: 3rem;
        background: var(--dc-secondary);
        color: white;
        border-radius: var(--dc-radius-md);
        font-weight: 600;
        font-size: var(--dc-font-body);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--dc-space-2);
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
      }
      .refresh-btn:active { transform: scale(0.95); }

      @media (min-width: ${bp.lg}) {
        .card {
          border-radius: 1.5rem;
          padding: var(--dc-space-10);
        }

        .summary {
          font-size: var(--dc-font-h1);
          margin-bottom: var(--dc-space-6);
        }

        .icon-grid { display: none; }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--dc-space-4);
          margin-bottom: var(--dc-space-10);
        }

        .detail-cell {
          background: var(--dc-surface-low);
          padding: var(--dc-space-6);
          border-radius: var(--dc-radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .detail-cell:hover { background: var(--dc-surface-container); transform: scale(1.02); }

        .detail-type {
          font-size: var(--dc-font-caption);
          font-weight: 700;
          color: var(--dc-text-secondary);
          margin-bottom: var(--dc-space-4);
          align-self: flex-start;
        }

        .detail-emoji {
          font-size: 3rem;
          margin-bottom: var(--dc-space-3);
        }

        .detail-name {
          font-size: var(--dc-font-body);
          font-weight: 500;
          color: var(--dc-text);
        }

        .tip-box {
          padding: var(--dc-space-6);
          border-radius: var(--dc-radius-lg);
          border-left: 4px solid var(--dc-primary);
          margin-bottom: var(--dc-space-10);
        }

        .refresh-btn {
          width: 12.5rem;
          margin: 0 auto;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.items = [];
    this.summary = '';
    this.tip = '';
  }

  #handleRefresh() {
    this.dispatchEvent(new CustomEvent('dc-refresh', { bubbles: true, composed: true }));
  }

  render() {
    const palette = this.items.map(i => i.colorHex).filter(Boolean);

    return html`
      <div class="card">
        <div class="palette">
          ${this.summary ? html`<h3 class="summary">${this.summary}</h3>` : ''}
          ${palette.length > 0 ? html`
            <div class="palette-dots">
              ${palette.map(c => html`
                <div class="palette-dot ${isWhiteColor(c) ? 'white' : ''}" style="background: ${c}"></div>
              `)}
            </div>
          ` : ''}
        </div>

        <!-- Mobile: compact icon grid -->
        <div class="icon-grid">
          ${this.items.map(item => html`
            <div class="icon-cell">
              <span class="material-symbols-outlined">${TYPE_MATERIAL_ICONS[item.category] ?? 'checkroom'}</span>
              <span>${item.category}</span>
            </div>
          `)}
        </div>

        <!-- Desktop: detail grid -->
        <div class="detail-grid">
          ${this.items.map(item => html`
            <div class="detail-cell">
              <span class="detail-type">${item.category}</span>
              <span class="detail-emoji">${TYPE_EMOJI[item.category] ?? '👔'}</span>
              <span class="detail-name">${item.name}</span>
            </div>
          `)}
        </div>

        ${this.tip ? html`
          <div class="tip-box">
            <span>💡</span>
            <span>${this.tip}</span>
          </div>
        ` : ''}

        <button class="refresh-btn" @click=${this.#handleRefresh}>
          다른 코디 추천
        </button>
      </div>
    `;
  }
}

customElements.define('outfit-card', OutfitCard);
