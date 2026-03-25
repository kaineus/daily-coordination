import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { TYPE_ORDER } from '../../constants/clothing.js';
import { chatStore } from '../../store/chat.store.js';
import { closetStore } from '../../store/closet.store.js';
import { StoreController } from '../../store/store-controller.js';
import { sendChatMessage } from '../../services/chat.service.js';
import { addClothing } from '../../services/closet.service.js';
import '../atoms/dc-button.js';
import '../molecules/color-picker.js';
import '../molecules/parsed-item-card.js';
import '../molecules/suggestion-chip.js';

const QUICK_SUGGESTIONS = ['"검정 패딩"', '"베이지 니트"', '"네이비 슬랙스"', '"흰색 셔츠"'];

const WELCOME = {
  role: 'assistant',
  content: '등록할 옷을 말해주세요 😊\n예: "검정 패딩이랑 베이지 니트"',
  items: [],
  suggestions: [],
  needsClarification: false,
};

export class AddClothingModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    categories: { type: Array },
    // Manual state
    _selectedType: { state: true },
    _selectedCategory: { state: true },
    _selectedColor: { state: true },
    _selectedColorName: { state: true },
    // AI tab state
    _registering: { state: true },
    _successIndices: { state: true },
  };

  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #chatMessages = new StoreController(this, chatStore, (s) => s.messages);
  #chatLoading = new StoreController(this, chatStore, (s) => s.loading);

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
        display: flex;
        flex-direction: column;
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

      /* ===== Divider ===== */
      .divider {
        display: flex;
        align-items: center;
        gap: var(--dc-space-3);
        margin: var(--dc-space-2) 0;
      }
      .divider-line {
        flex: 1;
        height: 1px;
        background: var(--dc-outline-variant);
        opacity: 0.3;
      }
      .divider-text {
        font-size: var(--dc-font-caption);
        color: var(--dc-outline);
        white-space: nowrap;
      }

      /* ===== Manual Body ===== */
      .body {
        padding: 0 var(--dc-space-6) var(--dc-space-10);
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-8);
        overflow-y: auto;
        flex: 1;
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

      .type-chips { display: flex; flex-wrap: wrap; gap: var(--dc-space-2); }
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
      .type-chip.active { background: var(--dc-primary-light); color: var(--dc-primary); }

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

      .preview { display: flex; justify-content: center; }
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

      /* ===== AI Section ===== */
      .ai-body {
        display: flex;
        flex-direction: column;
      }

      .chat-area {
        max-height: 16rem;
        overflow-y: auto;
        padding: 0 var(--dc-space-6) var(--dc-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-3);
      }

      /* AI message row */
      .ai-row {
        display: flex;
        gap: var(--dc-space-2);
        max-width: 85%;
      }
      .ai-avatar {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        background: var(--dc-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }
      .ai-avatar .material-symbols-outlined { font-size: 1rem; color: var(--dc-primary); }
      .ai-msg-body {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-2);
      }
      .ai-bubble {
        padding: var(--dc-space-3) var(--dc-space-4);
        background: var(--dc-surface-low);
        border-radius: 1rem;
        border-bottom-left-radius: 0.25rem;
        font-size: var(--dc-font-body);
        line-height: 1.6;
        white-space: pre-line;
      }

      /* User message */
      .user-row {
        display: flex;
        justify-content: flex-end;
      }
      .user-bubble {
        padding: var(--dc-space-2) var(--dc-space-4);
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        border-radius: 1rem;
        border-bottom-right-radius: 0.25rem;
        font-size: var(--dc-font-body);
        max-width: 75%;
        line-height: 1.5;
      }

      /* Items list */
      .items-list {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-2);
      }

      /* Action buttons */
      .actions { display: flex; gap: var(--dc-space-2); margin-top: var(--dc-space-1); }
      .reg-btn {
        flex: 1;
        height: 2.25rem;
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 600;
        transition: all 0.15s;
      }
      .reg-btn:active { transform: scale(0.97); }
      .reg-btn:disabled { opacity: 0.5; pointer-events: none; }
      .edit-btn {
        height: 2.25rem;
        padding: 0 var(--dc-space-4);
        background: var(--dc-surface-high);
        color: var(--dc-text-secondary);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 500;
      }
      .edit-btn:active { transform: scale(0.97); }

      /* Suggestions */
      .suggestions { display: flex; flex-wrap: wrap; gap: var(--dc-space-2); }

      /* Success */
      .success-row {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
      }
      .success-icon {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pop-in 0.4s ease-out;
      }
      .success-icon .material-symbols-outlined { font-size: 0.75rem; color: var(--dc-success); }
      .success-text { font-size: var(--dc-font-body); font-weight: 600; color: var(--dc-success); }
      .success-detail { font-size: var(--dc-font-caption); color: var(--dc-text-secondary); margin-top: 0.125rem; }
      @keyframes pop-in {
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Typing dots */
      .typing { display: flex; gap: 0.25rem; align-items: center; height: 1.25rem; }
      .typing-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--dc-outline);
        animation: typing 1.4s infinite;
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-4px); }
      }

      /* Input bar */
      .input-bar {
        padding: var(--dc-space-3) var(--dc-space-6) var(--dc-space-6);
        border-top: 1px solid rgba(193, 199, 210, 0.15);
      }
      .input-row { display: flex; gap: var(--dc-space-2); align-items: flex-end; }
      .input-row textarea {
        flex: 1;
        min-height: 2.5rem;
        max-height: 5rem;
        padding: var(--dc-space-2) var(--dc-space-4);
        background: var(--dc-surface-low);
        border: none;
        border-radius: var(--dc-radius-md);
        font-family: inherit;
        font-size: var(--dc-font-body);
        color: var(--dc-text);
        resize: none;
        outline: none;
        line-height: 1.5;
      }
      .input-row textarea::placeholder { color: var(--dc-outline); }
      .send-btn {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 94, 161, 0.2);
        transition: all 0.15s;
      }
      .send-btn:active { transform: scale(0.9); }
      .send-btn:disabled { opacity: 0.5; pointer-events: none; }
      .send-btn .material-symbols-outlined { font-size: 1.125rem; }

      .quick-chips {
        display: flex;
        gap: var(--dc-space-1);
        margin-top: var(--dc-space-2);
        overflow-x: auto;
        scrollbar-width: none;
      }
      .quick-chips::-webkit-scrollbar { display: none; }
      .quick-chip {
        white-space: nowrap;
        padding: var(--dc-space-1) var(--dc-space-2);
        background: var(--dc-surface-low);
        border-radius: var(--dc-radius-full);
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--dc-text-secondary);
        cursor: pointer;
        flex-shrink: 0;
      }
      .quick-chip:active { transform: scale(0.95); }
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
    this._registering = false;
    this._successIndices = [];
  }

  updated(changed) {
    if (changed.has('open') && this.open) {
      this.#initChat();
    }
    const area = this.shadowRoot?.querySelector('.chat-area');
    if (area) requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
  }

  #initChat() {
    const msgs = chatStore.getState().messages;
    if (msgs.length === 0) {
      chatStore.actions.addAssistantMessage(WELCOME);
    }
  }

  // ===== Manual tab =====
  #close() {
    this.open = false;
    this._selectedType = '';
    this._selectedCategory = null;
    this._selectedColor = '';
    this._selectedColorName = '';
    this._successIndices = [];
    chatStore.actions.reset();
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

  // ===== AI tab =====
  async #handleChatSend(text) {
    if (!text?.trim() || this.#chatLoading.value) return;
    chatStore.actions.addUserMessage(text.trim());
    chatStore.actions.setLoading(true);

    try {
      const apiMessages = chatStore.getState().messages
        .filter((_, i) => i > 0)
        .map(({ role, content }) => ({ role, content }));

      const { data, error } = await sendChatMessage(this.#supabase.value, apiMessages);
      if (error) {
        chatStore.actions.addAssistantMessage({
          message: `오류: ${error.message ?? error.error ?? '알 수 없는 오류'}`,
          items: [], suggestions: [], needsClarification: false,
        });
      } else {
        chatStore.actions.addAssistantMessage(data);
      }
    } catch {
      chatStore.actions.addAssistantMessage({
        message: '네트워크 오류가 발생했어요. 다시 시도해주세요.',
        items: [], suggestions: [], needsClarification: false,
      });
    } finally {
      chatStore.actions.setLoading(false);
    }
  }

  #handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.#sendFromInput();
    }
  }

  #sendFromInput() {
    const ta = this.shadowRoot?.querySelector('.ai-input');
    if (!ta) return;
    this.#handleChatSend(ta.value);
    ta.value = '';
    ta.style.height = 'auto';
  }

  #handleInputChange(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
  }

  async #handleRegister(items, idx) {
    this._registering = true;
    const sb = this.#supabase.value;

    const results = await Promise.allSettled(
      items.map((item) => addClothing(sb, {
        categoryId: item.categoryId,
        color: item.color,
        colorName: item.colorName,
      }))
    );

    const succeeded = [];
    results.forEach((r) => {
      if (r.status === 'fulfilled' && !r.value.error && r.value.data) {
        succeeded.push(r.value.data);
        closetStore.actions.addItem(r.value.data);
      }
    });

    this._successIndices = [...this._successIndices, { idx, count: succeeded.length, total: items.length }];
    this._registering = false;

    // 모달 닫기 이벤트 (옷장 리스트 갱신)
    this.dispatchEvent(new CustomEvent('dc-clothing-add', {
      detail: { fromAI: true, count: succeeded.length },
      bubbles: true, composed: true,
    }));
  }

  #isLastAssistant(index) {
    const msgs = this.#chatMessages.value ?? [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') return i === index;
    }
    return false;
  }

  // ===== Render =====
  render() {
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

          <!-- AI Input (상단) -->
          ${this.#renderAI()}

          <!-- 구분선 -->
          <div class="body" style="padding-top:0;padding-bottom:0">
            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">또는 직접 선택</span>
              <span class="divider-line"></span>
            </div>
          </div>

          <!-- Manual Selection (하단) -->
          ${this.#renderManual()}
        </div>
      </div>
    `;
  }

  #renderManual() {
    const categories = this.categories ?? [];
    const subCategories = this._selectedType
      ? categories.filter((c) => c.type === this._selectedType)
      : [];
    const canSubmit = this._selectedCategory && this._selectedColor;

    return html`
      <div class="body">
        <section>
          <span class="section-label">카테고리</span>
          <div class="type-chips">
            ${TYPE_ORDER.map((type) => html`
              <button class="type-chip ${this._selectedType === type ? 'active' : ''}"
                @click=${() => this.#selectType(type)}>${type}</button>
            `)}
          </div>
        </section>

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

        ${this._selectedCategory ? html`
          <section>
            <span class="section-label">색상</span>
            <color-picker value=${this._selectedColor} @dc-color-select=${this.#selectColor}></color-picker>
          </section>
        ` : ''}

        ${canSubmit ? html`
          <div class="preview">
            <div class="preview-pill">
              ${this._selectedCategory.icon} ${this._selectedCategory.name} · ${this._selectedColorName}
            </div>
          </div>
        ` : ''}

        <dc-button variant="primary" ?disabled=${!canSubmit} @click=${this.#submit}>등록하기</dc-button>
      </div>
    `;
  }

  #renderAI() {
    const messages = this.#chatMessages.value ?? [];
    const loading = this.#chatLoading.value;

    return html`
      <div class="ai-body">
        <div class="chat-area">
          ${messages.map((msg, i) => this.#renderChatMessage(msg, i))}

          ${loading ? html`
            <div class="ai-row">
              <div class="ai-avatar"><span class="material-symbols-outlined">auto_awesome</span></div>
              <div class="ai-bubble">
                <div class="typing">
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                  <span class="typing-dot"></span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="input-bar">
          <div class="input-row">
            <textarea class="ai-input" rows="1" placeholder="옷을 알려주세요..."
              ?disabled=${loading || this._registering}
              @input=${this.#handleInputChange}
              @keydown=${this.#handleInputKeydown}
            ></textarea>
            <button class="send-btn"
              ?disabled=${loading || this._registering}
              @click=${this.#sendFromInput}>
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
          <div class="quick-chips">
            ${QUICK_SUGGESTIONS.map((s) => html`
              <button class="quick-chip"
                @click=${() => this.#handleChatSend(s.replace(/"/g, ''))}>${s}</button>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  #renderChatMessage(msg, index) {
    if (msg.role === 'user') {
      return html`
        <div class="user-row">
          <div class="user-bubble">${msg.content}</div>
        </div>
      `;
    }

    const hasItems = msg.items?.length > 0;
    const hasSuggestions = msg.suggestions?.length > 0;
    const isLast = this.#isLastAssistant(index);
    const success = this._successIndices.find((s) => s.idx === index);

    return html`
      <div class="ai-row">
        <div class="ai-avatar"><span class="material-symbols-outlined">auto_awesome</span></div>
        <div class="ai-msg-body">
          <div class="ai-bubble">${msg.content}</div>

          ${hasItems ? html`
            <div class="items-list">
              ${msg.items.map((item) => html`
                <parsed-item-card
                  category-icon=${item.categoryIcon}
                  category-name=${item.categoryName}
                  color-name=${item.colorName}
                  color-hex=${item.color}
                  ?checked=${!msg.needsClarification}
                ></parsed-item-card>
              `)}
            </div>

            ${!msg.needsClarification && isLast && !success ? html`
              <div class="actions">
                <button class="reg-btn" ?disabled=${this._registering}
                  @click=${() => this.#handleRegister(msg.items, index)}>
                  ${this._registering ? '등록 중...' : '등록하기'}
                </button>
                <button class="edit-btn"
                  @click=${() => this.#handleChatSend('수정할게요')}>수정</button>
              </div>
            ` : ''}
          ` : ''}

          ${hasSuggestions ? html`
            <div class="suggestions">
              ${msg.suggestions.map((s) => html`
                <suggestion-chip label=${s}
                  @dc-suggestion-select=${(e) => this.#handleChatSend(e.detail.label.replace(/^\p{Emoji_Presentation}\s*/u, ''))}
                ></suggestion-chip>
              `)}
            </div>
          ` : ''}

          ${success ? html`
            <div>
              <div class="success-row">
                <div class="success-icon"><span class="material-symbols-outlined">check</span></div>
                <span class="success-text">등록 완료!</span>
              </div>
              <div class="success-detail">${success.count}개 옷장에 추가됐어요</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('add-clothing-modal', AddClothingModal);
