import { LitElement, html, css, nothing } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { getCategories } from '../../services/closet.service.js';
import { createCategory, updateCategory, deleteCategory, getCategoryClothesCount } from '../../services/admin.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import '../atoms/dc-spinner.js';

export class AdminCategoriesPage extends LitElement {
  static properties = {
    _categories: { state: true },
    _loading: { state: true },
    _expandedTypes: { state: true },
    _editingId: { state: true },
    _editForm: { state: true },
    _deleteTarget: { state: true },
    _addingToType: { state: true },
    _addForm: { state: true },
    _addingNewType: { state: true },
    _newTypeForm: { state: true },
  };

  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });

  static styles = [
    reset, tokens, materialIcons,
    css`
      :host { display: block; }

      .page-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: var(--dc-space-6);
      }
      .page-header h1 {
        font-family: var(--dc-font-headline); font-size: var(--dc-font-h1);
        font-weight: 700; color: var(--dc-text);
      }
      .page-header .admin-badge {
        padding: 0.125rem 0.5rem; border-radius: var(--dc-radius-full);
        background: #ffdeab; color: #7b5500;
        font-size: var(--dc-font-tiny); font-weight: 600;
      }

      .loading { display: flex; justify-content: center; padding: var(--dc-space-12); }

      /* Accordion */
      .accordion { margin-bottom: var(--dc-space-3); }
      .accordion-header {
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        padding: var(--dc-space-4); background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-lg); box-shadow: var(--dc-shadow-ambient);
        cursor: pointer; transition: background 0.15s;
      }
      .accordion-header:hover { background: var(--dc-surface-low); }
      .accordion-header.expanded { border-radius: var(--dc-radius-lg) var(--dc-radius-lg) 0 0; }
      .accordion-left { display: flex; align-items: center; gap: var(--dc-space-3); }
      .accordion-left .material-symbols-outlined { font-size: 1.25rem; color: var(--dc-text-secondary); }
      .accordion-left .type-emoji { font-size: 1.125rem; }
      .accordion-left .type-name { font-size: 0.9375rem; font-weight: 600; color: var(--dc-text); }
      .accordion-left .type-count {
        font-size: var(--dc-font-caption); font-weight: 500; color: var(--dc-outline);
        background: var(--dc-surface-high); padding: 0.125rem 0.375rem; border-radius: var(--dc-radius-sm);
      }
      .add-cat-btn {
        display: flex; align-items: center; gap: 0.125rem;
        color: var(--dc-primary); font-size: var(--dc-font-caption); font-weight: 600; cursor: pointer;
      }
      .add-cat-btn .material-symbols-outlined { font-size: 1rem; }

      /* Category List */
      .cat-list {
        background: var(--dc-surface-lowest); border-radius: 0 0 var(--dc-radius-lg) var(--dc-radius-lg);
        box-shadow: var(--dc-shadow-ambient); overflow: hidden;
      }

      /* Row */
      .cat-row {
        display: flex; align-items: center; padding: var(--dc-space-3) var(--dc-space-4);
        border-top: 1px solid rgba(193,199,210,0.15);
      }
      .cat-row .cat-icon { font-size: 1rem; margin-right: var(--dc-space-3); }
      .cat-row .cat-info { flex: 1; min-width: 0; }
      .cat-row .cat-name { font-size: var(--dc-font-body); font-weight: 500; color: var(--dc-text); }
      .cat-row .cat-meta { font-size: var(--dc-font-tiny); color: var(--dc-outline); }
      .cat-row .cat-actions { display: flex; gap: var(--dc-space-1); }
      .cat-row .action-btn {
        padding: 0.375rem; border-radius: var(--dc-radius-sm); cursor: pointer; transition: background 0.15s;
      }
      .cat-row .action-btn:hover { background: var(--dc-surface-high); }
      .cat-row .action-btn.delete:hover { background: #ffdad6; }
      .cat-row .action-btn .material-symbols-outlined { font-size: 1.125rem; color: var(--dc-text-secondary); }

      /* Edit Mode */
      .cat-edit {
        padding: var(--dc-space-3) var(--dc-space-4);
        border-top: 1px solid rgba(0,94,161,0.2); background: rgba(210,228,255,0.2);
      }
      .edit-row { display: flex; align-items: center; gap: var(--dc-space-2); margin-bottom: var(--dc-space-2); }
      .edit-row:last-child { margin-bottom: 0; }
      .edit-input {
        background: var(--dc-surface-lowest); border: none; border-radius: var(--dc-radius-sm);
        padding: 0.375rem 0.75rem; font-size: var(--dc-font-body); color: var(--dc-text);
        outline: none;
      }
      .edit-input:focus { box-shadow: 0 0 0 1px rgba(0,94,161,0.3); }
      .edit-input.name { flex: 1; font-weight: 500; }
      .edit-input.icon { width: 3rem; text-align: center; }
      .edit-input.num { width: 3.5rem; text-align: center; font-size: var(--dc-font-caption); }
      .edit-label { font-size: var(--dc-font-tiny); color: var(--dc-outline); }
      .edit-actions { display: flex; gap: var(--dc-space-2); }
      .btn-save {
        flex: 1; padding: 0.5rem; border-radius: var(--dc-radius-sm);
        background: var(--dc-primary); color: var(--dc-on-primary);
        font-size: var(--dc-font-caption); font-weight: 600; cursor: pointer;
      }
      .btn-cancel {
        flex: 1; padding: 0.5rem; border-radius: var(--dc-radius-sm);
        background: var(--dc-surface-high); color: var(--dc-text-secondary);
        font-size: var(--dc-font-caption); font-weight: 500; cursor: pointer;
      }

      /* Add New Type */
      .add-type-btn {
        width: 100%; margin-top: var(--dc-space-6); padding: var(--dc-space-3);
        border-radius: var(--dc-radius-lg); border: 2px dashed rgba(193,199,210,0.4);
        color: var(--dc-text-secondary); font-size: var(--dc-font-body); font-weight: 500;
        display: flex; align-items: center; justify-content: center; gap: var(--dc-space-2);
        cursor: pointer; transition: all 0.15s;
      }
      .add-type-btn:hover { border-color: rgba(0,94,161,0.3); color: var(--dc-primary); }
      .add-type-btn .material-symbols-outlined { font-size: 1.25rem; }

      .new-type-form {
        margin-top: var(--dc-space-6); padding: var(--dc-space-4);
        background: var(--dc-surface-lowest); border-radius: var(--dc-radius-lg);
        box-shadow: var(--dc-shadow-ambient);
      }
      .new-type-form h3 {
        font-size: var(--dc-font-body); font-weight: 600; color: var(--dc-text);
        margin-bottom: var(--dc-space-3);
      }

      /* Delete Dialog Overlay */
      .dialog-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.3);
        backdrop-filter: blur(4px); z-index: 100;
        display: flex; align-items: flex-end; justify-content: center;
      }
      .dialog {
        background: var(--dc-surface-lowest); width: 100%; max-width: 28rem;
        border-radius: var(--dc-radius-xl) var(--dc-radius-xl) 0 0;
        padding: var(--dc-space-6) var(--dc-space-6) var(--dc-space-8);
        box-shadow: 0 -20px 40px rgba(26,28,31,0.1);
      }
      .dialog h3 {
        font-family: var(--dc-font-headline); font-weight: 700;
        font-size: 1.125rem; color: var(--dc-text); margin-bottom: var(--dc-space-2);
      }
      .dialog .desc { font-size: var(--dc-font-body); color: var(--dc-text-secondary); margin-bottom: var(--dc-space-1); }
      .dialog .warning {
        font-size: var(--dc-font-caption); color: #ba1a1a; margin-bottom: var(--dc-space-6);
      }
      .dialog .warning-box {
        background: rgba(255,218,214,0.3); border-radius: var(--dc-radius-sm);
        padding: var(--dc-space-3) var(--dc-space-4); margin-bottom: var(--dc-space-6);
      }
      .dialog .warning-box p {
        font-size: var(--dc-font-caption); color: #93000a;
        display: flex; align-items: center; gap: 0.375rem;
      }
      .dialog .warning-box .material-symbols-outlined { font-size: 1rem; }
      .dialog-actions { display: flex; gap: var(--dc-space-3); }
      .dialog-actions button {
        flex: 1; padding: var(--dc-space-3); border-radius: var(--dc-radius-lg);
        font-size: var(--dc-font-body); font-weight: 500; cursor: pointer;
      }
      .btn-dialog-cancel { background: var(--dc-surface-high); color: var(--dc-text-secondary); }
      .btn-dialog-delete { background: #ba1a1a; color: white; font-weight: 600; }

      /* ===== Desktop ===== */
      @media (min-width: ${bp.lg}) {
        .page-header h1 { font-size: var(--dc-font-display); font-weight: 800; }
        .page-header { margin-bottom: var(--dc-space-10); }

        .accordion-header { padding: var(--dc-space-5); }
        .accordion-left .type-name { font-size: 1.125rem; font-weight: 700; font-family: var(--dc-font-headline); }
        .add-cat-btn { font-size: var(--dc-font-body); padding: 0.375rem 0.75rem; border-radius: var(--dc-radius-sm); }
        .add-cat-btn:hover { background: rgba(210,228,255,0.5); }

        /* Grid layout for rows */
        .cat-row {
          display: grid; grid-template-columns: 1fr 60px 100px 70px 80px; gap: var(--dc-space-4); align-items: center;
          padding: var(--dc-space-3) var(--dc-space-6);
        }
        .cat-row .cat-icon { display: none; }
        .cat-row .cat-info { display: contents; }
        .cat-row .cat-name { font-size: 0.9375rem; }
        .cat-row .cat-icon-cell { text-align: center; font-size: 1rem; }
        .cat-row .cat-temp { text-align: center; font-size: var(--dc-font-caption); color: var(--dc-text-secondary); }
        .cat-row .cat-order { text-align: center; font-size: var(--dc-font-caption); color: var(--dc-text-secondary); }
        .cat-row .cat-actions { justify-content: center; }

        .table-header {
          display: grid; grid-template-columns: 1fr 60px 100px 70px 80px; gap: var(--dc-space-4);
          padding: var(--dc-space-2) var(--dc-space-6);
          font-size: 0.6875rem; font-weight: 600; color: var(--dc-outline);
          text-transform: uppercase; letter-spacing: 0.05em;
          border-top: 1px solid rgba(193,199,210,0.1);
        }
        .table-header span:not(:first-child) { text-align: center; }

        /* Edit mode grid */
        .cat-edit {
          display: grid; grid-template-columns: 1fr 60px 100px 70px 80px; gap: var(--dc-space-4);
          align-items: center; padding: var(--dc-space-3) var(--dc-space-6);
        }
        .cat-edit .edit-row { display: contents; }
        .cat-edit .edit-row-mobile { display: none; }
        .cat-edit .edit-input.name { width: 100%; }
        .cat-edit .edit-temp { display: flex; align-items: center; gap: 0.25rem; justify-content: center; }
        .cat-edit .edit-actions { justify-content: center; }

        .dialog {
          border-radius: var(--dc-radius-xl); max-width: 420px;
          align-self: center; padding: var(--dc-space-8);
        }
      }
    `,
  ];

  constructor() {
    super();
    this._categories = [];
    this._loading = true;
    this._expandedTypes = new Set();
    this._editingId = null;
    this._editForm = {};
    this._deleteTarget = null;
    this._addingToType = null;
    this._addForm = {};
    this._addingNewType = false;
    this._newTypeForm = { name: '', emoji: '' };
  }

  connectedCallback() {
    super.connectedCallback();
    this.#loadCategories();
  }

  async #loadCategories() {
    const sb = this.#supabase.value;
    if (!sb) return;
    this._loading = true;
    const { data } = await getCategories(sb);
    if (data) this._categories = data;
    this._loading = false;
  }

  #getTypeGroups() {
    const map = {};
    for (const cat of this._categories) {
      const type = cat.type;
      if (!map[type]) map[type] = [];
      map[type].push(cat);
    }
    return Object.entries(map).map(([type, items]) => ({
      type,
      emoji: items[0]?.icon ?? '',
      items: items.sort((a, b) => a.sort_order - b.sort_order),
    }));
  }

  #toggleType(type) {
    const next = new Set(this._expandedTypes);
    next.has(type) ? next.delete(type) : next.add(type);
    this._expandedTypes = next;
  }

  #startEdit(cat) {
    this._editingId = cat.id;
    this._editForm = {
      name: cat.name, icon: cat.icon,
      tempMin: cat.temp_min ?? '', tempMax: cat.temp_max ?? '',
      sortOrder: cat.sort_order,
    };
  }

  #cancelEdit() { this._editingId = null; this._editForm = {}; }

  async #saveEdit() {
    const sb = this.#supabase.value;
    const { error } = await updateCategory(sb, this._editingId, {
      name: this._editForm.name,
      icon: this._editForm.icon,
      tempMin: this._editForm.tempMin === '' ? null : Number(this._editForm.tempMin),
      tempMax: this._editForm.tempMax === '' ? null : Number(this._editForm.tempMax),
      sortOrder: Number(this._editForm.sortOrder),
    });
    if (!error) {
      this._editingId = null;
      await this.#loadCategories();
    }
  }

  async #confirmDelete(cat) {
    const sb = this.#supabase.value;
    const count = await getCategoryClothesCount(sb, cat.id);
    this._deleteTarget = { ...cat, clothesCount: count };
  }

  #cancelDelete() { this._deleteTarget = null; }

  async #executeDelete() {
    const sb = this.#supabase.value;
    const { error } = await deleteCategory(sb, this._deleteTarget.id);
    if (!error) {
      this._deleteTarget = null;
      await this.#loadCategories();
    }
  }

  #startAddCategory(type) {
    this._addingToType = type;
    const maxOrder = this._categories
      .filter((c) => c.type === type)
      .reduce((max, c) => Math.max(max, c.sort_order), 0);
    this._addForm = { name: '', icon: '', tempMin: '', tempMax: '', sortOrder: maxOrder + 1 };
  }

  #cancelAdd() { this._addingToType = null; this._addForm = {}; }

  async #saveAdd(type) {
    const sb = this.#supabase.value;
    const { error } = await createCategory(sb, {
      name: this._addForm.name, type,
      icon: this._addForm.icon,
      tempMin: this._addForm.tempMin === '' ? null : Number(this._addForm.tempMin),
      tempMax: this._addForm.tempMax === '' ? null : Number(this._addForm.tempMax),
      sortOrder: Number(this._addForm.sortOrder),
    });
    if (!error) {
      this._addingToType = null;
      this._addForm = {};
      if (!this._expandedTypes.has(type)) {
        const next = new Set(this._expandedTypes);
        next.add(type);
        this._expandedTypes = next;
      }
      await this.#loadCategories();
    }
  }

  #startAddType() { this._addingNewType = true; this._newTypeForm = { name: '', emoji: '' }; }
  #cancelAddType() { this._addingNewType = false; }

  async #saveNewType() {
    const sb = this.#supabase.value;
    const { error } = await createCategory(sb, {
      name: `${this._newTypeForm.name} 기본`,
      type: this._newTypeForm.name,
      icon: this._newTypeForm.emoji,
      tempMin: null, tempMax: null, sortOrder: 1,
    });
    if (!error) {
      this._addingNewType = false;
      const next = new Set(this._expandedTypes);
      next.add(this._newTypeForm.name);
      this._expandedTypes = next;
      await this.#loadCategories();
    }
  }

  #renderRow(cat) {
    if (this._editingId === cat.id) return this.#renderEditRow(cat);
    const tempStr = cat.temp_min != null || cat.temp_max != null
      ? `${cat.temp_min ?? ''}° ~ ${cat.temp_max ?? ''}°` : '-';
    return html`
      <div class="cat-row">
        <span class="cat-icon">${cat.icon}</span>
        <div class="cat-info">
          <p class="cat-name">${cat.name}</p>
          <p class="cat-meta">${tempStr}  ·  순서 ${cat.sort_order}</p>
        </div>
        <!-- Desktop cells -->
        <span class="cat-icon-cell">${cat.icon}</span>
        <span class="cat-temp">${tempStr}</span>
        <span class="cat-order">${cat.sort_order}</span>
        <div class="cat-actions">
          <button class="action-btn" @click=${() => this.#startEdit(cat)}>
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="action-btn delete" @click=${() => this.#confirmDelete(cat)}>
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    `;
  }

  #renderEditRow() {
    return html`
      <div class="cat-edit">
        <div class="edit-row">
          <input class="edit-input name" .value=${this._editForm.name}
            @input=${(e) => this._editForm = { ...this._editForm, name: e.target.value }} />
          <input class="edit-input icon" .value=${this._editForm.icon}
            @input=${(e) => this._editForm = { ...this._editForm, icon: e.target.value }} />
        </div>
        <div class="edit-row edit-row-mobile">
          <input class="edit-input num" type="number" .value=${String(this._editForm.tempMin)}
            @input=${(e) => this._editForm = { ...this._editForm, tempMin: e.target.value }} />
          <span class="edit-label">~</span>
          <input class="edit-input num" type="number" .value=${String(this._editForm.tempMax)}
            @input=${(e) => this._editForm = { ...this._editForm, tempMax: e.target.value }} />
          <span class="edit-label">°C</span>
          <span class="edit-label" style="margin-left:auto">순서</span>
          <input class="edit-input num" type="number" .value=${String(this._editForm.sortOrder)}
            @input=${(e) => this._editForm = { ...this._editForm, sortOrder: e.target.value }} />
        </div>
        <!-- Desktop: temp inline -->
        <div class="edit-temp">
          <input class="edit-input num" type="number" .value=${String(this._editForm.tempMin)}
            @input=${(e) => this._editForm = { ...this._editForm, tempMin: e.target.value }} />
          <span class="edit-label">~</span>
          <input class="edit-input num" type="number" .value=${String(this._editForm.tempMax)}
            @input=${(e) => this._editForm = { ...this._editForm, tempMax: e.target.value }} />
        </div>
        <input class="edit-input num" type="number" .value=${String(this._editForm.sortOrder)}
          style="margin:auto" @input=${(e) => this._editForm = { ...this._editForm, sortOrder: e.target.value }} />
        <div class="edit-actions">
          <button class="btn-save" @click=${() => this.#saveEdit()} ?disabled=${!this._editForm.name}>저장</button>
          <button class="btn-cancel" @click=${() => this.#cancelEdit()}>취소</button>
        </div>
      </div>
    `;
  }

  #renderAddRow(type) {
    if (this._addingToType !== type) return nothing;
    return html`
      <div class="cat-edit">
        <div class="edit-row">
          <input class="edit-input name" placeholder="카테고리명" .value=${this._addForm.name}
            @input=${(e) => this._addForm = { ...this._addForm, name: e.target.value }} />
          <input class="edit-input icon" placeholder="🔲" .value=${this._addForm.icon}
            @input=${(e) => this._addForm = { ...this._addForm, icon: e.target.value }} />
        </div>
        <div class="edit-row edit-row-mobile">
          <input class="edit-input num" type="number" placeholder="최저" .value=${String(this._addForm.tempMin)}
            @input=${(e) => this._addForm = { ...this._addForm, tempMin: e.target.value }} />
          <span class="edit-label">~</span>
          <input class="edit-input num" type="number" placeholder="최고" .value=${String(this._addForm.tempMax)}
            @input=${(e) => this._addForm = { ...this._addForm, tempMax: e.target.value }} />
          <span class="edit-label">°C</span>
          <span class="edit-label" style="margin-left:auto">순서</span>
          <input class="edit-input num" type="number" .value=${String(this._addForm.sortOrder)}
            @input=${(e) => this._addForm = { ...this._addForm, sortOrder: e.target.value }} />
        </div>
        <div class="edit-temp">
          <input class="edit-input num" type="number" placeholder="최저" .value=${String(this._addForm.tempMin)}
            @input=${(e) => this._addForm = { ...this._addForm, tempMin: e.target.value }} />
          <span class="edit-label">~</span>
          <input class="edit-input num" type="number" placeholder="최고" .value=${String(this._addForm.tempMax)}
            @input=${(e) => this._addForm = { ...this._addForm, tempMax: e.target.value }} />
        </div>
        <input class="edit-input num" type="number" .value=${String(this._addForm.sortOrder)}
          style="margin:auto" @input=${(e) => this._addForm = { ...this._addForm, sortOrder: e.target.value }} />
        <div class="edit-actions">
          <button class="btn-save" @click=${() => this.#saveAdd(type)} ?disabled=${!this._addForm.name}>추가</button>
          <button class="btn-cancel" @click=${() => this.#cancelAdd()}>취소</button>
        </div>
      </div>
    `;
  }

  #renderDeleteDialog() {
    if (!this._deleteTarget) return nothing;
    const t = this._deleteTarget;
    return html`
      <div class="dialog-overlay" @click=${(e) => { if (e.target === e.currentTarget) this.#cancelDelete(); }}>
        <div class="dialog">
          <h3>카테고리 삭제</h3>
          <p class="desc">"${t.name}"을 삭제하시겠습니까?</p>
          ${t.clothesCount > 0 ? html`
            <div class="warning-box">
              <p><span class="material-symbols-outlined">info</span>
                이 카테고리에 등록된 옷 <strong>${t.clothesCount}개</strong>도 함께 삭제됩니다.</p>
            </div>
          ` : html`<div style="margin-bottom:var(--dc-space-6)"></div>`}
          <div class="dialog-actions">
            <button class="btn-dialog-cancel" @click=${() => this.#cancelDelete()}>취소</button>
            <button class="btn-dialog-delete" @click=${() => this.#executeDelete()}>삭제</button>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this._loading) return html`<div class="loading"><dc-spinner size="2"></dc-spinner></div>`;

    const groups = this.#getTypeGroups();

    return html`
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:var(--dc-space-3)">
          <h1>카테고리 관리</h1>
          <span class="admin-badge">ADMIN</span>
        </div>
      </div>

      ${groups.map((g) => {
        const expanded = this._expandedTypes.has(g.type);
        return html`
          <section class="accordion">
            <button class="accordion-header ${expanded ? 'expanded' : ''}"
              @click=${(e) => {
                if (e.target.closest('.add-cat-btn')) return;
                this.#toggleType(g.type);
              }}>
              <div class="accordion-left">
                <span class="material-symbols-outlined"
                  style="font-variation-settings: 'FILL' 1">${expanded ? 'expand_more' : 'chevron_right'}</span>
                <span class="type-emoji">${g.emoji}</span>
                <span class="type-name">${g.type}</span>
                <span class="type-count">${g.items.length}</span>
              </div>
              <span class="add-cat-btn" @click=${(e) => { e.stopPropagation(); this.#startAddCategory(g.type); if (!expanded) this.#toggleType(g.type); }}>
                <span class="material-symbols-outlined">add</span>
                추가
              </span>
            </button>
            ${expanded ? html`
              <div class="cat-list">
                <div class="table-header">
                  <span>이름</span><span>아이콘</span><span>온도 범위</span><span>순서</span><span>작업</span>
                </div>
                ${g.items.map((cat) => this.#renderRow(cat))}
                ${this.#renderAddRow(g.type)}
              </div>
            ` : ''}
          </section>
        `;
      })}

      ${this._addingNewType ? html`
        <div class="new-type-form">
          <h3>새 상위분류 추가</h3>
          <div class="edit-row" style="display:flex;gap:var(--dc-space-2);margin-bottom:var(--dc-space-3)">
            <input class="edit-input name" placeholder="상위분류명 (예: 정장)" .value=${this._newTypeForm.name}
              @input=${(e) => this._newTypeForm = { ...this._newTypeForm, name: e.target.value }} />
            <input class="edit-input icon" placeholder="👔" .value=${this._newTypeForm.emoji}
              @input=${(e) => this._newTypeForm = { ...this._newTypeForm, emoji: e.target.value }} />
          </div>
          <div class="edit-actions" style="display:flex;gap:var(--dc-space-2)">
            <button class="btn-save" @click=${() => this.#saveNewType()} ?disabled=${!this._newTypeForm.name}>생성</button>
            <button class="btn-cancel" @click=${() => this.#cancelAddType()}>취소</button>
          </div>
        </div>
      ` : html`
        <button class="add-type-btn" @click=${() => this.#startAddType()}>
          <span class="material-symbols-outlined">add_circle_outline</span>
          새 상위분류 추가
        </button>
      `}

      ${this.#renderDeleteDialog()}
    `;
  }
}

customElements.define('admin-categories-page', AdminCategoriesPage);
