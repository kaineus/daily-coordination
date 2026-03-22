import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { StoreController } from '../../store/store-controller.js';
import { closetStore } from '../../store/closet.store.js';
import { getCategories, getUserClothes, deleteClothing } from '../../services/closet.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { TYPE_ORDER, TYPE_ICONS, TYPE_EMOJI } from '../../constants/clothing.js';
import '../atoms/dc-button.js';
import '../atoms/dc-spinner.js';
import '../molecules/closet-item.js';
import '../organisms/empty-state.js';
import '../organisms/add-clothing-modal.js';

export class ClosetPage extends LitElement {
  static properties = {
    _modalOpen: { state: true },
    _filterType: { state: true },
  };

  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #clothes = new StoreController(this, closetStore, (s) => s.clothes);
  #categories = new StoreController(this, closetStore, (s) => s.categories);
  #loading = new StoreController(this, closetStore, (s) => s.loading);
  #groupBy = new StoreController(this, closetStore, (s) => s.groupBy);

  static styles = [
    reset,
    tokens,
    css`
      :host { display: block; }

      /* ===== Header ===== */
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--dc-space-6);
      }

      h1 {
        font-family: var(--dc-font-headline);
        font-size: var(--dc-font-h1);
        font-weight: 700;
        color: var(--dc-text);
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: var(--dc-space-1);
        height: 2.25rem;
        padding: 0 var(--dc-space-4);
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-body);
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: var(--dc-shadow-sm);
      }
      .add-btn:active { transform: scale(0.95); }
      .add-btn .material-symbols-outlined { font-size: 1.125rem; }

      /* ===== Toggles & Filters ===== */
      .group-toggle {
        display: flex;
        gap: var(--dc-space-3);
        margin-bottom: var(--dc-space-8);
      }

      .toggle-btn {
        padding: var(--dc-space-2) var(--dc-space-4);
        border-radius: var(--dc-radius-full);
        font-size: var(--dc-font-body);
        font-weight: 500;
        color: var(--dc-text-secondary);
        background: var(--dc-surface-high);
        cursor: pointer;
        transition: all 0.2s;
      }
      .toggle-btn.active {
        background: var(--dc-primary-light);
        color: var(--dc-primary);
        font-weight: 700;
      }

      .filter-chips {
        display: none;
      }

      /* ===== Loading ===== */
      .loading {
        display: flex;
        justify-content: center;
        padding: var(--dc-space-12);
      }

      /* ===== Groups ===== */
      .groups { display: flex; flex-direction: column; gap: var(--dc-space-12); }

      .group-header {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
        margin-bottom: var(--dc-space-4);
        padding-left: var(--dc-space-1);
      }
      .group-header .material-symbols-outlined {
        font-size: 1.25rem;
        color: var(--dc-text-secondary);
      }
      .group-name {
        font-size: var(--dc-font-title);
        font-weight: 600;
        color: var(--dc-text);
      }
      .group-count {
        font-size: var(--dc-font-body);
        font-weight: 500;
        color: var(--dc-text-secondary);
      }

      .items {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-2);
      }

      /* ===== Desktop ===== */
      @media (min-width: ${bp.lg}) {
        h1 {
          font-size: var(--dc-font-display);
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .add-btn {
          border-radius: var(--dc-radius-sm);
          height: var(--dc-button-min-height);
          padding: 0 var(--dc-space-6);
          font-size: var(--dc-font-title);
        }

        .page-header { margin-bottom: var(--dc-space-10); }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--dc-space-3);
          margin-bottom: var(--dc-space-12);
        }

        .filter-chip {
          padding: var(--dc-space-2) var(--dc-space-5);
          border-radius: var(--dc-radius-full);
          font-size: var(--dc-font-body);
          font-weight: 500;
          background: var(--dc-surface-lowest);
          color: var(--dc-text-secondary);
          border: 1px solid rgba(193, 199, 210, 0.15);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-chip:hover { background: var(--dc-surface-low); }
        .filter-chip.active {
          background: var(--dc-primary-light);
          color: var(--dc-primary);
          font-weight: 600;
        }

        .groups { gap: var(--dc-space-16); }

        .group-header {
          margin-bottom: var(--dc-space-6);
        }
        .group-name {
          font-family: var(--dc-font-headline);
          font-size: var(--dc-font-h2);
          font-weight: 700;
        }
        .group-count {
          font-size: var(--dc-font-body);
          background: var(--dc-surface-container);
          padding: 0.125rem var(--dc-space-2);
          border-radius: var(--dc-radius-sm);
        }

        .items {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--dc-space-6);
        }
      }
    `,
  ];

  constructor() {
    super();
    this._modalOpen = false;
    this._filterType = '전체';
  }

  connectedCallback() {
    super.connectedCallback();
    this.#loadData();
  }

  async #loadData() {
    const sb = this.#supabase.value;
    if (!sb) return;
    closetStore.actions.setLoading(true);
    const [catRes, clothesRes] = await Promise.all([
      getCategories(sb),
      getUserClothes(sb),
    ]);
    if (catRes.data) closetStore.actions.setCategories(catRes.data);
    if (clothesRes.data) closetStore.actions.setClothes(clothesRes.data);
    closetStore.actions.setLoading(false);
  }

  async #handleDelete(e) {
    const { id } = e.detail;
    const { error } = await deleteClothing(this.#supabase.value, id);
    if (!error) closetStore.actions.removeItem(id);
  }

  #groupByCategory(clothes) {
    const filtered = this._filterType === '전체'
      ? clothes
      : clothes.filter((c) => c.category?.type === this._filterType);
    const groups = {};
    for (const item of filtered) {
      const type = item.category?.type ?? '기타';
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    }
    return TYPE_ORDER
      .filter((t) => groups[t]?.length > 0)
      .map((t) => ({ type: t, icon: TYPE_ICONS[t], emoji: TYPE_EMOJI[t], items: groups[t] }));
  }

  #groupByColor(clothes) {
    const groups = {};
    for (const item of clothes) {
      const key = item.color_name ?? '기타';
      if (!groups[key]) groups[key] = { color: item.color, items: [] };
      groups[key].items.push(item);
    }
    return Object.entries(groups).map(([name, g]) => ({
      type: name, icon: '', emoji: '', colorHex: g.color, items: g.items,
    }));
  }

  render() {
    const clothes = this.#clothes.value ?? [];
    const loading = this.#loading.value;
    const groupBy = this.#groupBy.value;

    return html`
      <div class="page-header">
        <h1>내 옷장</h1>
        <button class="add-btn" @click=${() => (this._modalOpen = true)}>
          <span class="material-symbols-outlined">add</span>
          <span>추가</span>
        </button>
      </div>

      ${loading ? html`<div class="loading"><dc-spinner size="2"></dc-spinner></div>`
      : clothes.length === 0 ? html`
        <empty-state
          icon="checkroom"
          title="옷장에 옷을 먼저 등록해주세요"
          description="카테고리와 색상으로 간단히 등록할 수 있어요"
          button-text="옷 등록하기"
          @click=${() => (this._modalOpen = true)}
        ></empty-state>
      ` : html`
        <div class="group-toggle">
          <button class="toggle-btn ${groupBy === 'category' ? 'active' : ''}"
            @click=${() => closetStore.actions.setGroupBy('category')}>카테고리순</button>
          <button class="toggle-btn ${groupBy === 'color' ? 'active' : ''}"
            @click=${() => closetStore.actions.setGroupBy('color')}>색상별</button>
        </div>

        <!-- Desktop filter chips -->
        ${groupBy === 'category' ? html`
          <div class="filter-chips">
            ${['전체', ...TYPE_ORDER].map((t) => html`
              <button class="filter-chip ${this._filterType === t ? 'active' : ''}"
                @click=${() => (this._filterType = t)}>
                ${t === '전체' ? t : `${TYPE_EMOJI[t]} ${t}`}
              </button>
            `)}
          </div>
        ` : ''}

        <div class="groups">
          ${(groupBy === 'category'
            ? this.#groupByCategory(clothes)
            : this.#groupByColor(clothes)
          ).map((group) => html`
            <section>
              <div class="group-header">
                ${group.icon
                  ? html`<span class="material-symbols-outlined">${group.icon}</span>`
                  : group.colorHex
                    ? html`<span style="display:inline-block;width:1rem;height:1rem;border-radius:50%;background:${group.colorHex}"></span>`
                    : ''}
                <span class="group-name">${group.emoji ? `${group.emoji} ` : ''}${group.type}</span>
                <span class="group-count">${group.items.length}</span>
              </div>
              <div class="items">
                ${group.items.map((item) => html`
                  <closet-item
                    item-id=${item.id}
                    category-name=${item.category?.name ?? ''}
                    color-name=${item.color_name}
                    color-hex=${item.color}
                    @dc-delete=${this.#handleDelete}
                  ></closet-item>
                `)}
              </div>
            </section>
          `)}
        </div>
      `}

      <add-clothing-modal
        ?open=${this._modalOpen}
        @dc-modal-close=${() => (this._modalOpen = false)}
      ></add-clothing-modal>
    `;
  }
}

customElements.define('closet-page', ClosetPage);
