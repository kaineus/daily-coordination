import { LitElement, html, css } from 'lit';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { TYPE_ORDER } from '../../constants/clothing.js';
import '../atoms/dc-button.js';
import '../molecules/color-picker.js';

export class AddClothingModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    categories: { type: Array },
    _selectedType: { state: true },
    _selectedCategory: { state: true },
    _selectedColor: { state: true },
    _selectedColorName: { state: true },
  };

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host { display: none; }
      :host([open]) { display: block; }

      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(26, 28, 31, 0.4);
        backdrop-filter: blur(0.5rem);
        z-index: 100;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .modal {
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg) var(--dc-radius-lg) 0 0;
        width: 100%;
        max-width: 32rem;
        max-height: 85dvh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      @media (min-width: ${bp.md}) {
        .overlay { align-items: center; }
        .modal {
          border-radius: var(--dc-radius-xl);
          max-height: 80dvh;
        }
      }

      /* Drag handle */
      .handle {
        display: flex;
        justify-content: center;
        padding-top: var(--dc-space-3);
        padding-bottom: var(--dc-space-1);
      }
      .handle-bar {
        width: 2.5rem;
        height: 0.25rem;
        border-radius: var(--dc-radius-full);
        background: var(--dc-surface-high);
        opacity: 0.5;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--dc-space-4) var(--dc-space-6);
      }
      .header h2 {
        font-family: var(--dc-font-headline);
        font-size: var(--dc-font-h2);
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .close-btn {
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--dc-radius-full);
        color: var(--dc-text-secondary);
        transition: background 0.15s;
      }
      .close-btn:hover { background: var(--dc-surface-low); }

      .body {
        padding: 0 var(--dc-space-6) var(--dc-space-10);
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-8);
      }

      .section-label {
        display: block;
        font-size: var(--dc-font-caption);
        font-weight: 600;
        color: var(--dc-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: var(--dc-space-3);
      }

      /* Type chips */
      .type-chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--dc-space-2);
      }
      .type-chip {
        padding: var(--dc-space-2) var(--dc-space-4);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 600;
        background: var(--dc-surface-low);
        color: var(--dc-text-secondary);
        cursor: pointer;
        transition: all 0.2s;
      }
      .type-chip:hover { background: var(--dc-surface-high); }
      .type-chip.active {
        background: var(--dc-primary-light);
        color: var(--dc-primary);
      }

      /* Sub-category chips (horizontal scroll) */
      .sub-chips {
        display: flex;
        overflow-x: auto;
        gap: var(--dc-space-2);
        margin: 0 calc(var(--dc-space-1) * -1);
        padding: 0 var(--dc-space-1);
        scrollbar-width: none;
      }
      .sub-chips::-webkit-scrollbar { display: none; }

      .sub-chip {
        white-space: nowrap;
        padding: var(--dc-space-2) var(--dc-space-4);
        border-radius: var(--dc-radius-sm);
        font-size: var(--dc-font-body);
        background: var(--dc-surface-low);
        color: var(--dc-text-secondary);
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
      }
      .sub-chip.active {
        background: var(--dc-primary-light);
        color: var(--dc-primary);
        border-color: rgba(0, 94, 161, 0.1);
      }

      /* Preview pill */
      .preview {
        display: flex;
        justify-content: center;
      }
      .preview-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--dc-space-2);
        padding: var(--dc-space-2) var(--dc-space-4);
        background: var(--dc-surface-container);
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-body);
        font-weight: 600;
        color: var(--dc-text-secondary);
        letter-spacing: -0.02em;
      }

      .error-msg {
        color: var(--dc-danger);
        font-size: var(--dc-font-caption);
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.categories = [];
    this._selectedType = '';
    this._selectedCategory = null;
    this._selectedColor = '';
    this._selectedColorName = '';
  }

  #close() {
    this.open = false;
    this._selectedType = '';
    this._selectedCategory = null;
    this._selectedColor = '';
    this._selectedColorName = '';
    this.dispatchEvent(new CustomEvent('dc-modal-close', { bubbles: true, composed: true }));
  }

  #selectType(type) {
    this._selectedType = type;
    this._selectedCategory = null;
  }

  #selectCategory(cat) { this._selectedCategory = cat; }

  #selectColor(e) {
    this._selectedColor = e.detail.hex;
    this._selectedColorName = e.detail.name;
  }

  #submit() {
    if (!this._selectedCategory || !this._selectedColor) return;
    this.dispatchEvent(new CustomEvent('dc-clothing-add', {
      detail: {
        categoryId: this._selectedCategory.id,
        color: this._selectedColor,
        colorName: this._selectedColorName,
      },
      bubbles: true, composed: true,
    }));
    this.#close();
  }

  #handleOverlayClick(e) {
    if (e.target === e.currentTarget) this.#close();
  }

  render() {
    const categories = this.categories ?? [];
    const subCategories = this._selectedType
      ? categories.filter((c) => c.type === this._selectedType)
      : [];
    const canSubmit = this._selectedCategory && this._selectedColor;

    return html`
      <div class="overlay" @click=${this.#handleOverlayClick}>
        <div class="modal">
          <div class="handle"><div class="handle-bar"></div></div>

          <div class="header">
            <h2>옷 등록하기</h2>
            <button class="close-btn" @click=${this.#close}>
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="body">
            <!-- 상위 분류 -->
            <section>
              <span class="section-label">카테고리</span>
              <div class="type-chips">
                ${TYPE_ORDER.map((type) => html`
                  <button class="type-chip ${this._selectedType === type ? 'active' : ''}"
                    @click=${() => this.#selectType(type)}>${type}</button>
                `)}
              </div>
            </section>

            <!-- 하위 카테고리 -->
            ${subCategories.length > 0 ? html`
              <section>
                <span class="section-label">세부 카테고리</span>
                <div class="sub-chips">
                  ${subCategories.map((cat) => html`
                    <button class="sub-chip ${this._selectedCategory?.id === cat.id ? 'active' : ''}"
                      @click=${() => this.#selectCategory(cat)}>${cat.name}</button>
                  `)}
                </div>
              </section>
            ` : ''}

            <!-- 색상 -->
            ${this._selectedCategory ? html`
              <section>
                <span class="section-label">색상</span>
                <color-picker
                  value=${this._selectedColor}
                  @dc-color-select=${this.#selectColor}
                ></color-picker>
              </section>
            ` : ''}

            <!-- 프리뷰 -->
            ${canSubmit ? html`
              <div class="preview">
                <div class="preview-pill">
                  ${this._selectedCategory.icon} ${this._selectedCategory.name} · ${this._selectedColorName}
                </div>
              </div>
            ` : ''}

            <!-- 등록 -->
            <dc-button
              variant="primary"
              ?disabled=${!canSubmit}
              @click=${this.#submit}
            >등록하기</dc-button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('add-clothing-modal', AddClothingModal);
