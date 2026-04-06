import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { StoreController } from '../../store/store-controller.js';
import { authStore } from '../../store/auth.store.js';
import { signOut } from '../../services/auth.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import '../molecules/user-avatar.js';

export class AppShell extends LitElement {
  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #user = new StoreController(this, authStore, (s) => s.user);
  #role = new StoreController(this, authStore, (s) => s.role);

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        background: var(--dc-bg);
      }

      /* ===== Desktop Header ===== */
      .desktop-header {
        display: none;
      }

      /* ===== Main ===== */
      main {
        flex: 1;
        padding: var(--dc-space-4);
        max-width: var(--dc-content-max-width);
        width: 100%;
        margin: 0 auto;
      }

      /* ===== Mobile Bottom Tab (64px) ===== */
      .bottom-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 4rem;
        background: var(--dc-surface-lowest);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.04);
        position: sticky;
        bottom: 0;
      }

      .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
        font-size: var(--dc-font-tiny);
        color: var(--dc-outline);
        padding: var(--dc-space-1) var(--dc-space-4);
        cursor: pointer;
        font-weight: 500;
        transition: color 0.15s;
      }
      .nav-item.active {
        color: var(--dc-primary);
        font-weight: 700;
      }
      .nav-item .material-symbols-outlined {
        font-size: 1.5rem;
      }

      /* ===== Desktop (>= 1024px) ===== */
      @media (min-width: ${bp.lg}) {
        .bottom-nav { display: none; }

        .desktop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 3.5rem;
          background: var(--dc-surface-lowest);
          padding: 0 var(--dc-space-8);
          box-shadow: var(--dc-shadow-sm);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .desktop-brand {
          font-family: var(--dc-font-headline);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dc-primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .desktop-nav {
          display: flex;
          gap: var(--dc-space-8);
          height: 100%;
        }

        .desktop-nav a {
          display: flex;
          align-items: center;
          font-size: var(--dc-font-body);
          font-weight: 500;
          color: var(--dc-text-secondary);
          height: 100%;
          transition: color 0.15s;
          border-bottom: 2px solid transparent;
        }
        .desktop-nav a:hover { color: var(--dc-primary); }
        .desktop-nav a.active {
          color: var(--dc-primary);
          font-weight: 700;
          border-bottom-color: var(--dc-primary);
        }

        .admin-badge {
          display: inline-block;
          padding: 0.125rem 0.375rem;
          border-radius: var(--dc-radius-full);
          background: #ffdeab;
          color: #7b5500;
          font-size: 0.625rem;
          font-weight: 600;
          margin-left: var(--dc-space-2);
        }

        .desktop-user {
          display: flex;
          align-items: center;
          gap: var(--dc-space-2);
        }

        .logout-btn {
          padding: var(--dc-space-1);
          border-radius: var(--dc-radius-sm);
          color: var(--dc-outline);
          transition: background 0.15s;
        }
        .logout-btn:hover { background: var(--dc-surface-low); }

        main {
          max-width: var(--dc-content-max-width-lg);
          padding: var(--dc-space-8) var(--dc-space-6);
        }
      }
    `,
  ];

  #onHashChange = () => this.requestUpdate();

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.#onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.#onHashChange);
  }

  #handleLogout() { signOut(this.#supabase.value); }

  #isActive(path) {
    const hash = window.location.hash.slice(1) || '/';
    return hash === path ? 'active' : '';
  }

  render() {
    const user = this.#user.value;
    const meta = user?.user_metadata ?? {};
    const name = meta.full_name ?? meta.name ?? '';

    return html`
      <!-- Desktop Header -->
      <header class="desktop-header">
        <span class="desktop-brand">오늘 뭐 입지?</span>
        <nav class="desktop-nav">
          <a class="${this.#isActive('/')}" href="#/">오늘의 코디</a>
          ${user ? html`
            <a class="${this.#isActive('/closet')}" href="#/closet">내 옷장</a>
            ${this.#role.value === 'admin' ? html`
              <a class="${this.#isActive('/admin/categories')}" href="#/admin/categories">관리</a>
            ` : ''}
          ` : ''}
        </nav>
        <div class="desktop-user">
          ${user ? html`
            ${this.#role.value === 'admin' ? html`<span class="admin-badge">ADMIN</span>` : ''}
            <user-avatar name=${name} image-url=${meta.avatar_url ?? ''} size="1.75"></user-avatar>
            <button class="logout-btn" @click=${this.#handleLogout}>
              <span class="material-symbols-outlined">logout</span>
            </button>
          ` : html`
            <a class="nav-item" href="#/login" style="color: var(--dc-primary); font-weight: 600;">
              <span class="material-symbols-outlined">login</span>
              로그인
            </a>
          `}
        </div>
      </header>

      <main><slot></slot></main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <a class="nav-item ${this.#isActive('/')}" href="#/">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${this.#isActive('/') ? '1' : '0'}">light_mode</span>
          <span>코디</span>
        </a>
        ${user ? html`
          <a class="nav-item ${this.#isActive('/closet')}" href="#/closet">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${this.#isActive('/closet') ? '1' : '0'}">checkroom</span>
            <span>옷장</span>
          </a>
          ${this.#role.value === 'admin' ? html`
            <a class="nav-item ${this.#isActive('/admin/categories')}" href="#/admin/categories">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${this.#isActive('/admin/categories') ? '1' : '0'}">admin_panel_settings</span>
              <span>관리</span>
            </a>
          ` : ''}
        ` : html`
          <a class="nav-item" href="#/login">
            <span class="material-symbols-outlined">login</span>
            <span>로그인</span>
          </a>
        `}
      </nav>
    `;
  }
}

customElements.define('app-shell', AppShell);
