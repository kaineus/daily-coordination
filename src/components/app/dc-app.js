import { LitElement, html, css } from 'lit';
import { ContextProvider } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { supabase } from '../../services/supabase.js';
import { initAuth, fetchUserRole } from '../../services/auth.service.js';
import { StoreController } from '../../store/store-controller.js';
import { authStore } from '../../store/auth.store.js';
import { HashRouter } from '../../router/routes.js';
import '../atoms/dc-spinner.js';
import '../pages/login-page.js';
import '../pages/home-page.js';
import '../pages/closet-page.js';
import '../pages/admin-categories-page.js';
import '../templates/app-shell.js';

export class DcApp extends LitElement {
  // Supabase를 context로 제공
  #provider = new ContextProvider(this, { context: supabaseContext, initialValue: supabase });

  // Auth 상태 구독
  #authLoading = new StoreController(this, authStore, (s) => s.loading);
  #user = new StoreController(this, authStore, (s) => s.user);
  #role = new StoreController(this, authStore, (s) => s.role);

  // Hash Router
  #router = new HashRouter(this, [
    { path: '/login', render: () => html`<login-page></login-page>` },
    {
      path: '/',
      render: () => html`<app-shell><home-page></home-page></app-shell>`,
    },
    {
      path: '/closet',
      render: () => html`<app-shell><closet-page></closet-page></app-shell>`,
    },
    {
      path: '/admin/categories',
      render: () => html`<app-shell><admin-categories-page></admin-categories-page></app-shell>`,
    },
    { path: '*', render: () => html`<login-page></login-page>` },
  ]);

  static styles = css`
    :host {
      display: block;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
    }
  `;

  constructor() {
    super();
    // Supabase auth 초기화 (router보다 먼저)
    initAuth(supabase, async (session) => {
      authStore.actions.setSession(session);
      if (session?.user) {
        const role = await fetchUserRole(supabase);
        authStore.actions.setRole(role);
      } else {
        authStore.actions.setRole(null);
      }
    });
  }

  render() {
    // 로딩 중
    if (this.#authLoading.value) {
      return html`<div class="loading"><dc-spinner size="32"></dc-spinner></div>`;
    }

    // 미인증 → 로그인 페이지
    const hash = window.location.hash.slice(1) || '/';
    if (!this.#user.value && hash !== '/login' && hash !== '/') {
      window.location.hash = '/login';
      return html`<login-page></login-page>`;
    }

    // 인증 완료인데 /login에 있으면 → 메인
    if (this.#user.value && hash === '/login') {
      window.location.hash = '/';
    }

    // admin 가드: /admin/* 접근 시 role !== 'admin'이면 리다이렉트
    if (hash.startsWith('/admin') && this.#role.value !== 'admin') {
      window.location.hash = '/';
      return this.#router.outlet();
    }

    return this.#router.outlet();
  }
}

customElements.define('dc-app', DcApp);
