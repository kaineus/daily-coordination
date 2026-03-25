import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { StoreController } from '../../store/store-controller.js';
import { chatStore } from '../../store/chat.store.js';
import { closetStore } from '../../store/closet.store.js';
import { sendChatMessage } from '../../services/chat.service.js';
import { addClothing } from '../../services/closet.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import '../atoms/typing-indicator.js';
import '../molecules/chat-message.js';
import '../molecules/parsed-item-card.js';
import '../molecules/suggestion-chip.js';
import '../organisms/chat-input-bar.js';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: '안녕하세요! 등록할 옷을 자연어로 말해주세요 😊\n예: "검정 패딩이랑 베이지 니트 등록해줘"',
  items: [],
  suggestions: [],
  needsClarification: false,
};

export class ChatPage extends LitElement {
  static properties = {
    _registering: { state: true },
    _successItems: { state: true },
  };

  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #messages = new StoreController(this, chatStore, (s) => s.messages);
  #loading = new StoreController(this, chatStore, (s) => s.loading);

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        background: var(--dc-bg);
      }

      /* ===== Header ===== */
      .header {
        display: flex;
        align-items: center;
        gap: var(--dc-space-3);
        padding: var(--dc-space-3) var(--dc-space-4);
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .back-btn {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--dc-text);
        transition: background 0.15s;
      }
      .back-btn:hover { background: var(--dc-surface-low); }
      .back-btn .material-symbols-outlined { font-size: 1.25rem; }

      .header-text { flex: 1; }

      .header-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--dc-text);
      }

      .header-sub {
        font-size: 0.6875rem;
        color: var(--dc-outline);
      }

      /* ===== Message List ===== */
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: var(--dc-space-4);
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-4);
      }

      /* ===== AI Bubble Content ===== */
      .ai-content {
        display: flex;
        gap: var(--dc-space-2);
        max-width: 90%;
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

      .ai-avatar-icon {
        font-family: 'Material Symbols Outlined';
        font-size: 1rem;
        color: var(--dc-primary);
      }

      .ai-body {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-2);
        min-width: 0;
        flex: 1;
      }

      .ai-bubble {
        padding: var(--dc-space-3) var(--dc-space-4);
        background: var(--dc-surface-lowest);
        border-radius: 1rem;
        border-bottom-left-radius: 0.25rem;
        box-shadow: 0px 4px 12px rgba(26, 28, 31, 0.04);
        font-size: var(--dc-font-body);
        line-height: 1.6;
        color: var(--dc-text);
        white-space: pre-line;
      }

      /* ===== Items ===== */
      .items-list {
        display: flex;
        flex-direction: column;
        gap: var(--dc-space-2);
      }

      /* ===== Suggestions ===== */
      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--dc-space-2);
      }

      /* ===== Action Buttons ===== */
      .actions {
        display: flex;
        gap: var(--dc-space-2);
        margin-top: var(--dc-space-1);
      }

      .register-btn {
        flex: 1;
        height: 2.5rem;
        background: var(--dc-primary);
        color: var(--dc-on-primary);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 600;
        transition: all 0.15s;
      }
      .register-btn:active { transform: scale(0.97); }
      .register-btn:disabled { opacity: 0.5; pointer-events: none; }

      .edit-btn {
        height: 2.5rem;
        padding: 0 var(--dc-space-4);
        background: var(--dc-surface-high);
        color: var(--dc-text-secondary);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 500;
        transition: all 0.15s;
      }
      .edit-btn:active { transform: scale(0.97); }

      /* ===== Success ===== */
      .success-row {
        display: flex;
        align-items: center;
        gap: var(--dc-space-2);
      }

      .success-icon {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pop-in 0.4s ease-out forwards;
      }

      .success-icon .material-symbols-outlined {
        font-size: 0.875rem;
        color: var(--dc-success);
      }

      .success-text {
        font-size: var(--dc-font-body);
        font-weight: 600;
        color: var(--dc-success);
      }

      .success-detail {
        font-size: var(--dc-font-caption);
        color: var(--dc-text-secondary);
        margin-top: var(--dc-space-1);
      }

      @keyframes pop-in {
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }

      /* ===== Input ===== */
      .input-area {
        position: sticky;
        bottom: 0;
        z-index: 10;
      }

      /* ===== Desktop ===== */
      @media (min-width: ${bp.lg}) {
        :host {
          max-width: 48rem;
          margin: 0 auto;
          border-left: 1px solid rgba(193, 199, 210, 0.15);
          border-right: 1px solid rgba(193, 199, 210, 0.15);
        }

        .ai-content { max-width: 80%; }

        .items-list {
          flex-direction: row;
        }

        .items-list parsed-item-card {
          flex: 1;
        }
      }
    `,
  ];

  constructor() {
    super();
    this._registering = false;
    this._successItems = [];
  }

  connectedCallback() {
    super.connectedCallback();
    // 새 채팅 시작 시 리셋 + 환영 메시지
    chatStore.actions.reset();
    chatStore.actions.addAssistantMessage(WELCOME_MESSAGE);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    chatStore.actions.reset();
  }

  updated() {
    this.#scrollToBottom();
  }

  render() {
    const messages = this.#messages.value ?? [];
    const loading = this.#loading.value;

    return html`
      <div class="header">
        <button class="back-btn" @click=${this.#goBack}>
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="header-text">
          <div class="header-title">AI 옷 등록</div>
          <div class="header-sub">자연어로 옷을 등록해보세요</div>
        </div>
      </div>

      <div class="messages" id="msg-list">
        ${messages.map((msg, i) => this.#renderMessage(msg, i))}
        ${loading ? html`<typing-indicator></typing-indicator>` : ''}
      </div>

      <div class="input-area">
        <chat-input-bar
          ?disabled=${loading || this._registering}
          @dc-chat-send=${this.#handleSend}
        ></chat-input-bar>
      </div>
    `;
  }

  #renderMessage(msg, index) {
    if (msg.role === 'user') {
      return html`<chat-message role="user" content=${msg.content}></chat-message>`;
    }

    // Assistant 메시지 — 복합 렌더링
    const hasItems = msg.items?.length > 0;
    const hasSuggestions = msg.suggestions?.length > 0;
    const isLastAssistant = this.#isLastAssistant(index);
    const successForThis = this._successItems.find((s) => s.messageIndex === index);

    return html`
      <div class="ai-content">
        <div class="ai-avatar">
          <span class="ai-avatar-icon">auto_awesome</span>
        </div>
        <div class="ai-body">
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

            ${!msg.needsClarification && isLastAssistant && !successForThis ? html`
              <div class="actions">
                <button class="register-btn"
                  ?disabled=${this._registering}
                  @click=${() => this.#handleRegister(msg.items, index)}
                >
                  ${this._registering ? '등록 중...' : '등록하기'}
                </button>
                <button class="edit-btn" @click=${() => this.#handleEdit()}>수정</button>
              </div>
            ` : ''}
          ` : ''}

          ${hasSuggestions ? html`
            <div class="suggestions">
              ${msg.suggestions.map((s) => html`
                <suggestion-chip
                  label=${s}
                  @dc-suggestion-select=${this.#handleSuggestion}
                ></suggestion-chip>
              `)}
            </div>
          ` : ''}

          ${successForThis ? html`
            <div>
              <div class="success-row">
                <div class="success-icon">
                  <span class="material-symbols-outlined">check</span>
                </div>
                <span class="success-text">등록 완료!</span>
              </div>
              <div class="success-detail">${successForThis.summary}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  #isLastAssistant(index) {
    const messages = this.#messages.value ?? [];
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i === index;
    }
    return false;
  }

  async #handleSend(e) {
    const { text } = e.detail;
    chatStore.actions.addUserMessage(text);
    chatStore.actions.setLoading(true);

    try {
      // API에 보낼 메시지 (환영 메시지 제외, role/content만)
      const apiMessages = (chatStore.getState().messages)
        .filter((_, i) => i > 0) // 환영 메시지 제외
        .map(({ role, content }) => ({ role, content }));

      const { data, error } = await sendChatMessage(this.#supabase.value, apiMessages);

      if (error) {
        chatStore.actions.addAssistantMessage({
          message: `오류가 발생했어요: ${error.message ?? error.error ?? '알 수 없는 오류'}`,
          items: [],
          suggestions: [],
          needsClarification: false,
        });
      } else {
        chatStore.actions.addAssistantMessage(data);
      }
    } catch (err) {
      chatStore.actions.addAssistantMessage({
        message: '네트워크 오류가 발생했어요. 다시 시도해주세요.',
        items: [],
        suggestions: [],
        needsClarification: false,
      });
    } finally {
      chatStore.actions.setLoading(false);
    }
  }

  #handleSuggestion(e) {
    const { label } = e.detail;
    // 이모지 제거하고 텍스트만 추출
    const text = label.replace(/^\p{Emoji_Presentation}\s*/u, '').trim();
    this.#handleSend({ detail: { text } });
  }

  #handleEdit() {
    // 수정 요청을 위한 안내 메시지
    chatStore.actions.addAssistantMessage({
      message: '어떤 부분을 수정할까요? 예: "색상은 네이비로 바꿔줘"',
      items: [],
      suggestions: [],
      needsClarification: false,
    });
  }

  async #handleRegister(items, messageIndex) {
    this._registering = true;
    const sb = this.#supabase.value;

    const results = await Promise.allSettled(
      items.map((item) =>
        addClothing(sb, {
          categoryId: item.categoryId,
          color: item.color,
          colorName: item.colorName,
        })
      )
    );

    const succeeded = [];
    const failed = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && !r.value.error && r.value.data) {
        succeeded.push(r.value.data);
        closetStore.actions.addItem(r.value.data);
      } else {
        failed.push(items[i]);
      }
    });

    const names = succeeded.map((d) => `${d.color_name} ${d.category?.name}`).join(', ');
    let summary;
    if (failed.length === 0) {
      summary = `${names}${items.length > 1 ? '이' : '가'} 옷장에 추가됐어요!`;
    } else {
      summary = `${succeeded.length}개 성공, ${failed.length}개 실패`;
    }

    this._successItems = [...this._successItems, { messageIndex, summary }];
    this._registering = false;
  }

  #goBack() {
    window.location.hash = '/closet';
  }

  #scrollToBottom() {
    const list = this.shadowRoot?.getElementById('msg-list');
    if (list) {
      requestAnimationFrame(() => {
        list.scrollTop = list.scrollHeight;
      });
    }
  }
}

customElements.define('chat-page', ChatPage);
