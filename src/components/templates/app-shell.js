import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { StoreController } from '../../store/store-controller.js';
import { authStore } from '../../store/auth.store.js';
import { signOut } from '../../services/auth.service.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import '../molecules/user-avatar.js';

export class AppShell extends LitElement {
  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #user = new StoreController(this, authStore, (s) => s.user);

  static styles = [
    reset,
    tokens,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        background: var(--dc-bg);
      }

      /* ===== Mobile Header (hidden on desktop) ===== */
      .mobile-header {
        display: none;
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

  #handleLogout() { signOut(this.#supabase.value); }

  render() {
    const user = this.#user.value;
    const meta = user?.user_metadata ?? {};
    const name = meta.full_name ?? meta.name ?? '';

    return html`
      <!-- Desktop Header -->
      <header class="desktop-header">
        <span class="desktop-brand">오늘 뭐 입지?</span>
        <nav class="desktop-nav">
          <a class="active" href="#/">오늘의 코디</a>
          <a href="#/closet">내 옷장</a>
        </nav>
        <div class="desktop-user">
          <user-avatar name=${name} image-url=${meta.avatar_url ?? ''} size="1.75"></user-avatar>
          <button class="logout-btn" @click=${this.#handleLogout}>
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main><slot></slot></main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <a class="nav-item active" href="#/">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">light_mode</span>
          <span>코디</span>
        </a>
        <a class="nav-item" href="#/closet">
          <span class="material-symbols-outlined">checkroom</span>
          <span>옷장</span>
        </a>
        <a class="nav-item" href="#/profile">
          <span class="material-symbols-outlined">person</span>
          <span>내정보</span>
        </a>
      </nav>
    `;
  }
}

customElements.define('app-shell', AppShell);
