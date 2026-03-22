import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

const PRESETS = [
  { name: '검정', hex: '#333333' },
  { name: '흰색', hex: '#FFFFFF' },
  { name: '회색', hex: '#808080' },
  { name: '네이비', hex: '#1E3A8A' },
  { name: '베이지', hex: '#F5E6D3' },
  { name: '브라운', hex: '#4B3621' },
  { name: '민트', hex: '#34D399' },
  { name: '빨강', hex: '#FF4444' },
  { name: '주황', hex: '#FF8844' },
  { name: '노랑', hex: '#FFCC00' },
  { name: '초록', hex: '#44BB44' },
  { name: '파랑', hex: '#4488FF' },
  { name: '분홍', hex: '#FF88AA' },
];

export class ColorPicker extends LitElement {
  static properties = {
    value: { type: String },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host { display: block; }

      .grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--dc-space-4) var(--dc-space-2);
        justify-items: center;
      }

      .swatch {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--dc-space-1);
        cursor: pointer;
      }

      .dot {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--dc-radius-full);
        border: 1px solid rgba(193, 199, 210, 0.3);
        transition: all 0.2s;
      }
      .dot.white {
        border-color: var(--dc-outline-variant);
      }

      .dot.selected {
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 2px var(--dc-primary-container);
      }

      .swatch:not(.selected-swatch) {
        opacity: 0.6;
      }
      .swatch.selected-swatch {
        opacity: 1;
      }
      .no-selection .swatch {
        opacity: 1;
      }

      .label {
        font-size: var(--dc-font-tiny);
        color: var(--dc-text-secondary);
        font-weight: 500;
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
  }

  #select(preset) {
    this.value = preset.hex;
    this.dispatchEvent(new CustomEvent('dc-color-select', {
      detail: { hex: preset.hex, name: preset.name },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const hasSelection = !!this.value;
    return html`
      <div class="grid ${hasSelection ? '' : 'no-selection'}">
        ${PRESETS.map((p) => {
          const sel = this.value === p.hex;
          const isWhite = p.hex === '#FFFFFF';
          return html`
            <div class="swatch ${sel ? 'selected-swatch' : ''}" @click=${() => this.#select(p)}>
              <div
                class="dot ${sel ? 'selected' : ''} ${isWhite ? 'white' : ''}"
                style="background: ${p.hex}"
              ></div>
              <span class="label">${p.name}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('color-picker', ColorPicker);
