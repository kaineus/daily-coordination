import { LitElement, html, css } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { TYPE_EMOJI } from '../../constants/clothing.js';
import { SVG_MAP } from '../../constants/svg-map.js';
import { isWhiteColor } from '../../utils/color.js';

/**
 * 아이템별 살짝 다른 기울기 (비대칭 감성)
 */
const ROTATIONS = ['-1.5deg', '1deg', '-0.5deg', '1.5deg'];

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
        border-radius: 1.25rem;
        padding: var(--dc-space-6);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
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

      /* ===== Color Palette ===== */
      .palette {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
        margin-bottom: var(--dc-space-4);
      }
      .palette-dot {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
      }
      .palette-dot.white { border: 1px solid var(--dc-outline-variant); }

      /* ===== Scrap Container (수직 착장 순서) ===== */
      .scrap-container {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--dc-space-4);
        background-image: repeating-linear-gradient(
          0deg, transparent, transparent 39px, rgba(193,199,210,0.03) 39px, rgba(193,199,210,0.03) 40px
        ),
        repeating-linear-gradient(
          90deg, transparent, transparent 39px, rgba(193,199,210,0.03) 39px, rgba(193,199,210,0.03) 40px
        );
      }

      /* 겹침 효과 (2번째부터) */
      .scrap-row + .scrap-row {
        margin-top: -1rem;
      }

      /* ===== Scrap Row: 카드 + 텍스트 교차 배치 ===== */
      .scrap-row {
        display: flex;
        align-items: center;
        gap: var(--dc-space-3);
        position: relative;
      }

      /* 홀수: 카드 좌 + 텍스트 우 / 짝수: 텍스트 좌 + 카드 우 */
      .scrap-row.even {
        flex-direction: row-reverse;
      }

      .scrap-card {
        width: 55%;
        background: white;
        border-radius: var(--dc-radius-sm);
        padding: var(--dc-space-3);
        box-shadow: 2px 3px 8px rgba(26,28,31,0.08), 0 1px 2px rgba(26,28,31,0.04);
        position: relative;
        transition: box-shadow 0.3s;
        flex-shrink: 0;
      }
      .scrap-card:hover {
        box-shadow: 4px 6px 16px rgba(26,28,31,0.12), 0 2px 4px rgba(26,28,31,0.06);
      }

      /* Tape */
      .tape {
        position: absolute;
        top: -0.5rem;
        left: 50%;
        transform: translateX(-50%);
        width: 2.5rem;
        height: 1.25rem;
        background: linear-gradient(135deg, rgba(210,228,255,0.7), rgba(210,228,255,0.4));
        backdrop-filter: blur(4px);
        border-radius: 0.125rem;
        z-index: 10;
        opacity: 0.8;
      }

      .svg-wrap {
        aspect-ratio: 4 / 3;
        background: linear-gradient(135deg, #f8f8fc, #ededf1);
        border-radius: var(--dc-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .svg-wrap svg {
        width: 70%;
        height: 70%;
      }
      .emoji-fallback { font-size: 2.5rem; }

      /* ===== Scrap Text (카드 옆 독립 영역) ===== */
      .scrap-text {
        flex: 1;
        min-width: 0;
      }

      .scrap-type {
        font-size: var(--dc-font-tiny);
        font-weight: 600;
        color: var(--dc-outline);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.125rem;
      }

      .scrap-name {
        font-size: var(--dc-font-body);
        font-weight: 700;
        color: var(--dc-text);
        margin-bottom: var(--dc-space-1);
      }

      .scrap-color-row {
        display: flex;
        align-items: center;
        gap: var(--dc-space-1);
      }

      .color-dot {
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.1);
        flex-shrink: 0;
      }

      .scrap-color-name {
        font-size: var(--dc-font-caption);
        color: var(--dc-text-secondary);
      }

      /* ===== Tip & Refresh ===== */
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
        .summary { font-size: var(--dc-font-h1); margin-bottom: var(--dc-space-6); }
        .scrap-card { width: 50%; }
        .scrap-name { font-size: var(--dc-font-title); }
        .tip-box {
          padding: var(--dc-space-6);
          border-radius: var(--dc-radius-lg);
          border-left: 4px solid var(--dc-primary);
          margin-bottom: var(--dc-space-10);
        }
        .refresh-btn { width: 12.5rem; margin: 0 auto; }
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
    const palette = this.items.map((i) => i.colorHex).filter(Boolean);

    return html`
      <div class="card">
        ${this.summary ? html`<h3 class="summary">${this.summary}</h3>` : ''}

        ${palette.length > 0 ? html`
          <div class="palette">
            ${palette.map((c) => html`
              <div class="palette-dot ${isWhiteColor(c) ? 'white' : ''}" style="background: ${c}"></div>
            `)}
          </div>
        ` : ''}

        <div class="scrap-container">
          ${this.items.slice(0, 4).map((item, i) => this.#renderScrapRow(item, i))}
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

  #renderScrapRow(item, index) {
    const isEven = index % 2 === 1;
    const svg = SVG_MAP[item.name];
    const emoji = TYPE_EMOJI[item.category] ?? '👔';
    const rotation = ROTATIONS[index] ?? '0deg';

    return html`
      <div class="scrap-row ${isEven ? 'even' : ''}">
        <div class="scrap-card" style="transform: rotate(${rotation}); z-index: ${index + 1}">
          <div class="tape"></div>
          <div class="svg-wrap" style="color: ${item.colorHex ?? '#666'}">
            ${svg ? unsafeSVG(svg) : html`<span class="emoji-fallback">${emoji}</span>`}
          </div>
        </div>
        <div class="scrap-text">
          <div class="scrap-type">${item.category}</div>
          <div class="scrap-name">${item.name}</div>
          <div class="scrap-color-row">
            <div class="color-dot ${isWhiteColor(item.colorHex) ? 'white' : ''}"
              style="background: ${item.colorHex ?? '#ccc'}"></div>
            <span class="scrap-color-name">${item.colorName ?? ''}</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('outfit-card', OutfitCard);
