import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';

const PRESETS = [
  { name: '빨강', hex: '#FF4444' },
  { name: '주황', hex: '#FF8844' },
  { name: '노랑', hex: '#FFCC00' },
  { name: '초록', hex: '#44BB44' },
  { name: '파랑', hex: '#4488FF' },
  { name: '남색', hex: '#2244AA' },
  { name: '보라', hex: '#8844CC' },
  { name: '분홍', hex: '#FF88AA' },
  { name: '흰색', hex: '#FFFFFF' },
  { name: '회색', hex: '#999999' },
  { name: '검정', hex: '#333333' },
  { name: '갈색', hex: '#8B4513' },
  { name: '베이지', hex: '#D2B48C' },
];

export class ColorPicker extends LitElement {
  static properties = {
    value: { type: String },
    valueName: { type: String, attribute: 'value-name' },
  };

  static styles = [
    reset,
    tokens,
    css`
      :host { display: block; }

      .grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--dc-space-4);
        justify-content: center;
      }

      .swatch {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--dc-space-2);
        cursor: pointer;
      }

      .dot {
        width: 2rem;
        height: 2rem;
        border-radius: var(--dc-radius-full);
        border: 1px solid rgba(193,199,210,0.2);
        box-shadow: var(--dc-shadow-sm);
        transition: all 0.2s;
      }
      .dot.white { border-color: var(--dc-outline-variant); }

      .dot.selected {
        width: 2.5rem;
        height: 2.5rem;
        border: 2px solid white;
        box-shadow: var(--dc-shadow-lg), 0 0 0 2px var(--dc-primary);
      }

      .label {
        font-size: var(--dc-font-tiny);
        color: var(--dc-outline);
        font-weight: 500;
      }
      .label.selected {
        color: var(--dc-primary);
        font-weight: 700;
      }
    `,
  ];

  constructor() {
    super();
    this.value = '';
    this.valueName = '';
  }

  #select(preset) {
    this.value = preset.hex;
    this.valueName = preset.name;
    this.dispatchEvent(new CustomEvent('dc-color-select', {
      detail: { hex: preset.hex, name: preset.name },
      bubbles: true, composed: true,
    }));
  }

  render() {
    return html`
      <div class="grid">
        ${PRESETS.map(p => {
          const sel = this.value === p.hex;
          const isWhite = p.hex === '#FFFFFF';
          return html`
            <div class="swatch" @click=${() => this.#select(p)}>
              <div
                class="dot ${sel ? 'selected' : ''} ${isWhite ? 'white' : ''}"
                style="background: ${p.hex}"
              ></div>
              <span class="label ${sel ? 'selected' : ''}">${p.name}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('color-picker', ColorPicker);
