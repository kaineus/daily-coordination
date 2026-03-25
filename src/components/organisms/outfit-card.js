import { LitElement, html, css, unsafeCSS } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { TYPE_EMOJI } from '../../constants/clothing.js';
import { SVG_MAP } from '../../constants/svg-map.js';
import { isWhiteColor } from '../../utils/color.js';

/**
 * 스크랩 아이템 배치 프리셋 (최대 4개)
 * position, width, rotation, z-index
 */
const SCRAP_LAYOUT = [
  { top: '0', left: '0', width: '52%', rotate: '-2deg', z: 1 },
  { top: '1rem', right: '0', width: '44%', rotate: '1.5deg', z: 2 },
  { bottom: '3rem', left: '0.5rem', width: '46%', rotate: '1deg', z: 3 },
  { bottom: '0', right: '0.25rem', width: '42%', rotate: '-1.5deg', z: 4 },
];

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

      /* ===== Scrap Layout ===== */
      .scrap-container {
        position: relative;
        min-height: 20rem;
        margin-bottom: var(--dc-space-4);
        background-image: repeating-linear-gradient(
          0deg, transparent, transparent 39px, rgba(193,199,210,0.03) 39px, rgba(193,199,210,0.03) 40px
        ),
        repeating-linear-gradient(
          90deg, transparent, transparent 39px, rgba(193,199,210,0.03) 39px, rgba(193,199,210,0.03) 40px
        );
      }

      .scrap-item {
        position: absolute;
        background: white;
        border-radius: var(--dc-radius-sm);
        padding: var(--dc-space-4);
        box-shadow: 2px 3px 8px rgba(26,28,31,0.08), 0 1px 2px rgba(26,28,31,0.04);
        transition: box-shadow 0.3s;
      }
      .scrap-item:hover {
        box-shadow: 4px 6px 16px rgba(26,28,31,0.12), 0 2px 4px rgba(26,28,31,0.06);
      }

      /* Tape decoration */
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
        margin-bottom: var(--dc-space-2);
        overflow: hidden;
      }
      .svg-wrap svg {
        width: 70%;
        height: 70%;
      }

      .emoji-fallback {
        font-size: 2.5rem;
      }

      .scrap-info {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
      }

      .color-dot {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        border: 1px solid rgba(0,0,0,0.1);
        flex-shrink: 0;
      }

      .scrap-name {
        font-size: var(--dc-font-caption);
        font-weight: 700;
        color: var(--dc-text);
      }
      .scrap-color-name {
        font-size: var(--dc-font-tiny);
        color: var(--dc-text-secondary);
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
        .scrap-container { min-height: 26rem; }
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

        <!-- Color palette -->
        ${palette.length > 0 ? html`
          <div class="palette">
            ${palette.map((c) => html`
              <div class="palette-dot ${isWhiteColor(c) ? 'white' : ''}" style="background: ${c}"></div>
            `)}
          </div>
        ` : ''}

        <!-- Scrap Layout -->
        <div class="scrap-container">
          ${this.items.slice(0, 4).map((item, i) => this.#renderScrapItem(item, i))}
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

  #renderScrapItem(item, index) {
    const layout = SCRAP_LAYOUT[index] ?? SCRAP_LAYOUT[0];
    const svg = SVG_MAP[item.name];
    const emoji = TYPE_EMOJI[item.category] ?? '👔';

    const posStyle = [
      layout.top != null ? `top:${layout.top}` : '',
      layout.bottom != null ? `bottom:${layout.bottom}` : '',
      layout.left != null ? `left:${layout.left}` : '',
      layout.right != null ? `right:${layout.right}` : '',
      `width:${layout.width}`,
      `transform:rotate(${layout.rotate})`,
      `z-index:${layout.z}`,
    ].filter(Boolean).join(';');

    return html`
      <div class="scrap-item" style=${posStyle}>
        <div class="tape"></div>
        <div class="svg-wrap" style="color: ${item.colorHex ?? '#666'}">
          ${svg
            ? unsafeSVG(svg)
            : html`<span class="emoji-fallback">${emoji}</span>`}
        </div>
        <div class="scrap-info">
          <div class="color-dot ${isWhiteColor(item.colorHex) ? 'white' : ''}"
            style="background: ${item.colorHex ?? '#ccc'}"></div>
          <div>
            <div class="scrap-name">${item.name}</div>
            <div class="scrap-color-name">${item.colorName ?? ''}</div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('outfit-card', OutfitCard);
