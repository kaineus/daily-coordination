import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { supabaseContext } from '../../contexts/supabase.context.js';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/auth.service.js';
import { StoreController } from '../../store/store-controller.js';
import { authStore } from '../../store/auth.store.js';
import { tokens } from '../../styles/tokens.css.js';
import { reset } from '../../styles/reset.css.js';
import { bp } from '../../styles/breakpoints.css.js';
import { materialIcons } from '../../styles/material-icons.css.js';
import '../atoms/dc-button.js';
import '../atoms/dc-input.js';
import '../atoms/dc-spinner.js';

const IN_APP_REGEX = /KAKAOTALK|Line|FBAN|FBAV|Instagram|Twitter|Snapchat|WhatsApp|Telegram/i;

export class LoginPage extends LitElement {
  static properties = {
    _mode: { state: true },
    _email: { state: true },
    _password: { state: true },
    _passwordConfirm: { state: true },
    _message: { state: true },
    _submitting: { state: true },
    _isInApp: { state: true },
  };

  #supabase = new ContextConsumer(this, { context: supabaseContext, subscribe: true });
  #error = new StoreController(this, authStore, (s) => s.error);

  static styles = [
    reset,
    tokens,
    materialIcons,
    css`
      /* ===== Base (Mobile) ===== */
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        background: var(--dc-bg);
      }

      /* ===== Mobile Hero ===== */
      .mobile-hero {
        background: var(--dc-gradient-hero);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--dc-space-6);
        color: white;
      }
      .mobile-hero.login { height: var(--dc-hero-height-login); }
      .mobile-hero.signup {
        height: var(--dc-hero-height-signup);
        align-items: flex-start;
        padding: var(--dc-space-12) var(--dc-space-8) var(--dc-space-6);
        text-align: left;
      }

      /* ===== Desktop Left Panel ===== */
      .desktop-panel {
        display: none;
      }

      /* ===== Shared Decorations ===== */
      .deco-1 {
        position: absolute; top: -10%; right: -10%;
        width: 16rem; height: 16rem;
        background: rgba(255,255,255,0.1);
        border-radius: var(--dc-radius-full);
        filter: blur(3rem);
      }
      .deco-2 {
        position: absolute; bottom: -20%; left: -5%;
        width: 20rem; height: 20rem;
        background: rgba(43,120,191,0.3);
        border-radius: var(--dc-radius-full);
        filter: blur(3rem);
      }
      .deco-icon {
        position: absolute;
        color: white;
        opacity: 0.2;
        pointer-events: none;
      }
      .deco-icon.i1 { top: 0.625rem; left: 0.625rem; font-size: 7.5rem; }
      .deco-icon.i2 { bottom: 1.25rem; left: 1.25rem; font-size: 10rem; }
      .deco-icon.i3 { top: 25%; right: 0.625rem; font-size: 8.75rem; }
      .deco-icon.i4 { bottom: 25%; right: 1.25rem; font-size: 6.25rem; }

      .hero-content {
        position: relative; z-index: 1;
      }
      .hero-icon {
        display: flex;
        align-items: center; justify-content: center;
        width: 4.5rem; height: 4.5rem;
        background: rgba(255,255,255,0.2);
        backdrop-filter: blur(0.75rem);
        border-radius: var(--dc-radius-full);
        margin-bottom: var(--dc-space-4);
      }
      .hero-icon .material-symbols-outlined {
        font-size: 3rem;
        font-variation-settings: 'FILL' 1;
      }
      .hero-title {
        font-family: var(--dc-font-headline);
        font-weight: 800;
        font-size: 1.875rem;
        letter-spacing: 0.15em;
        margin-bottom: var(--dc-space-2);
      }
      .hero-title.signup {
        font-size: var(--dc-font-h1);
        letter-spacing: -0.01em;
      }
      .hero-desc {
        font-size: var(--dc-font-body);
        opacity: 0.8; font-weight: 500;
      }
      .back-btn {
        position: relative; z-index: 1;
        width: var(--dc-space-10); height: var(--dc-space-10);
        display: flex; align-items: center;
        color: white;
        margin-bottom: var(--dc-space-4);
      }
      .back-btn .material-symbols-outlined { font-size: 1.75rem; }

      /* ===== Right / Card Area ===== */
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .card-wrap {
        flex: 1;
        padding: 0 var(--dc-space-6);
        position: relative; z-index: 2;
      }
      .card-wrap.login { margin-top: -4rem; padding-bottom: var(--dc-space-12); }
      .card-wrap.signup { margin-top: -1.25rem; padding-bottom: var(--dc-space-12); }

      .card {
        max-width: var(--dc-card-max-width);
        margin: 0 auto;
        background: var(--dc-surface-lowest);
        border-radius: var(--dc-radius-xl);
        box-shadow: var(--dc-shadow-ambient);
        padding: var(--dc-space-8);
      }

      /* ===== Form Header (Desktop) ===== */
      .form-header { display: none; }

      /* ===== In-App Browser Banner ===== */
      .inapp-banner {
        display: flex;
        align-items: flex-start;
        gap: var(--dc-space-3);
        padding: var(--dc-space-4);
        background: rgba(255, 193, 7, 0.12);
        border-radius: var(--dc-radius-md);
        margin-bottom: var(--dc-space-6);
      }
      .inapp-banner .material-symbols-outlined {
        font-size: 1.25rem;
        color: #F59E0B;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .inapp-text {
        font-size: var(--dc-font-caption);
        color: var(--dc-text);
        line-height: 1.5;
      }
      .inapp-text strong { font-weight: 700; }
      .open-browser-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--dc-space-1);
        margin-top: var(--dc-space-2);
        padding: var(--dc-space-1) var(--dc-space-3);
        background: rgba(255, 193, 7, 0.2);
        border-radius: var(--dc-radius-sm);
        font-size: var(--dc-font-caption);
        font-weight: 600;
        color: #92400E;
        cursor: pointer;
      }
      .open-browser-btn:active { opacity: 0.7; }
      .open-browser-btn .material-symbols-outlined { font-size: 0.875rem; }

      /* ===== Google Button ===== */
      .google-btn {
        display: flex;
        align-items: center; justify-content: center;
        gap: var(--dc-space-3);
        width: 100%;
        padding: 0.875rem;
        background: white;
        border: 1px solid rgba(193,199,210,0.3);
        border-radius: var(--dc-radius-md);
        font-size: var(--dc-font-body);
        font-weight: 600;
        color: var(--dc-text);
        cursor: pointer;
        transition: background 0.2s;
        min-height: 3.25rem;
      }
      .google-btn:hover { background: var(--dc-surface-low); }
      .google-logo { width: 1.25rem; height: 1.25rem; }

      /* ===== Divider ===== */
      .divider {
        display: flex; align-items: center;
        margin: var(--dc-space-8) 0;
      }
      .divider::before, .divider::after {
        content: ''; flex: 1; height: 1px;
        background: rgba(193,199,210,0.2);
      }
      .divider span {
        padding: 0 var(--dc-space-4);
        font-size: var(--dc-font-caption);
        color: var(--dc-outline); font-weight: 500;
      }

      /* ===== Form ===== */
      .form { display: flex; flex-direction: column; gap: var(--dc-space-5); }

      .error-box {
        background: rgba(186,26,26,0.08);
        color: var(--dc-danger);
        font-size: var(--dc-font-body);
        padding: var(--dc-space-3) var(--dc-space-4);
        border-radius: var(--dc-radius-sm);
      }
      .success-box {
        background: rgba(76,175,80,0.08);
        color: var(--dc-success);
        font-size: var(--dc-font-body);
        padding: var(--dc-space-3) var(--dc-space-4);
        border-radius: var(--dc-radius-sm);
        line-height: 1.5;
      }
      .submit-btn { margin-top: var(--dc-space-4); }

      /* ===== Switch Link ===== */
      .switch-link {
        text-align: center;
        margin-top: var(--dc-space-8);
        font-size: var(--dc-font-body);
        color: var(--dc-text-secondary);
      }
      .switch-link a {
        color: var(--dc-primary); font-weight: 700;
        margin-left: var(--dc-space-1); cursor: pointer;
      }
      .switch-link a:hover {
        text-decoration: underline;
        text-underline-offset: 0.25rem;
      }

      /* ===== Footer ===== */
      .footer {
        margin-top: auto;
        padding: var(--dc-space-8);
        text-align: center;
      }
      .footer p {
        font-size: var(--dc-font-tiny);
        line-height: 1.6;
        color: var(--dc-outline); opacity: 0.7;
        max-width: 20rem; margin: 0 auto;
      }
      .footer u {
        text-decoration-color: rgba(113,119,130,0.3);
        text-underline-offset: 0.25rem;
      }

      /* ===== Desktop Layout (>= 1024px) ===== */
      @media (min-width: ${bp.lg}) {
        :host {
          flex-direction: row;
          height: 100dvh;
          overflow: hidden;
        }

        /* Hide mobile hero */
        .mobile-hero { display: none; }

        /* Show desktop left panel */
        .desktop-panel {
          display: flex;
          width: 50%;
          height: 100%;
          background: var(--dc-gradient-hero);
          position: relative;
          overflow: hidden;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: var(--dc-space-8);
        }

        .desktop-panel .hero-icon {
          width: 5.5rem; height: 5.5rem;
          margin-bottom: var(--dc-space-6);
        }
        .desktop-panel .hero-icon .material-symbols-outlined {
          font-size: 3.5rem;
        }
        .desktop-panel .hero-title {
          font-size: 2.5rem;
          letter-spacing: 0.2em;
        }
        .desktop-panel .hero-desc {
          font-size: var(--dc-font-title);
        }
        .desktop-panel .brand-footer {
          position: absolute;
          bottom: var(--dc-space-8);
          left: var(--dc-space-8);
          font-size: var(--dc-font-body);
          opacity: 0.4;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* Right panel */
        .right-panel {
          width: 50%;
          height: 100%;
          overflow-y: auto;
          background: var(--dc-surface);
          align-items: center;
          justify-content: center;
          padding: var(--dc-space-8) var(--dc-space-12);
        }

        .card-wrap {
          margin-top: 0;
          padding: 0;
          flex: unset;
        }
        .card-wrap.login, .card-wrap.signup {
          margin-top: 0;
          padding-bottom: 0;
        }

        .card {
          box-shadow: none;
          background: transparent;
          padding: 0;
          max-width: 27.5rem;
        }

        /* Show form header on desktop */
        .form-header {
          display: block;
          margin-bottom: var(--dc-space-8);
        }
        .form-header h2 {
          font-family: var(--dc-font-headline);
          font-size: var(--dc-font-display);
          font-weight: 700;
          color: var(--dc-text);
          letter-spacing: -0.02em;
          margin-bottom: var(--dc-space-2);
        }
        .form-header p {
          color: var(--dc-text-secondary);
          font-size: var(--dc-font-body);
          font-weight: 500;
        }

        .footer {
          position: absolute;
          bottom: var(--dc-space-8);
          width: 27.5rem;
        }

        /* Signup desktop: back button at top */
        .desktop-back {
          display: flex;
          position: absolute;
          top: var(--dc-space-8);
          left: var(--dc-space-8);
        }
      }

      /* Hide desktop-only elements on mobile */
      .desktop-back { display: none; }
    `,
  ];

  constructor() {
    super();
    this._mode = 'login';
    this._email = '';
    this._password = '';
    this._passwordConfirm = '';
    this._message = null;
    this._submitting = false;
    this._isInApp = IN_APP_REGEX.test(navigator.userAgent);
  }

  #switchMode(mode) {
    this._mode = mode;
    this._message = null;
    this._email = '';
    this._password = '';
    this._passwordConfirm = '';
    authStore.actions.clearError();
  }

  async #handleSubmit(e) {
    e.preventDefault();
    if (this._submitting) return;
    authStore.actions.clearError();
    this._message = null;

    if (this._mode === 'signup' && this._password !== this._passwordConfirm) {
      authStore.actions.setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    this._submitting = true;
    const sb = this.#supabase.value;

    if (this._mode === 'signup') {
      const { error } = await signUpWithEmail(sb, this._email, this._password);
      if (error) {
        authStore.actions.setError(error.message);
      } else {
        this._message = '회원가입 완료! 이메일을 확인해주세요.';
        this._email = '';
        this._password = '';
        this._passwordConfirm = '';
      }
    } else {
      const { error } = await signInWithEmail(sb, this._email, this._password);
      if (error) authStore.actions.setError(error.message);
    }
    this._submitting = false;
  }

  #handleGoogle() { signInWithGoogle(this.#supabase.value); }

  #openInBrowser() {
    const url = window.location.href;
    // Android: Chrome intent
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }
    // iOS/기타: 새 탭으로 시도 (일부 인앱 브라우저에서 기본 브라우저로 열림)
    window.open(url, '_blank');
  }

  #renderInAppBanner() {
    if (!this._isInApp) return '';
    return html`
      <div class="inapp-banner">
        <span class="material-symbols-outlined">warning</span>
        <div class="inapp-text">
          <strong>인앱 브라우저에서는 Google 로그인이 제한됩니다.</strong><br>
          Safari 또는 Chrome에서 열어주세요.
          <button class="open-browser-btn" @click=${this.#openInBrowser}>
            <span class="material-symbols-outlined">open_in_new</span>
            브라우저에서 열기
          </button>
        </div>
      </div>
    `;
  }

  render() {
    return this._mode === 'login' ? this.#renderLogin() : this.#renderSignup();
  }

  #renderDesktopPanel() {
    return html`
      <section class="desktop-panel">
        <div class="deco-1"></div>
        <div class="deco-2"></div>
        <span class="deco-icon i1 material-symbols-outlined">light_mode</span>
        <span class="deco-icon i2 material-symbols-outlined">cloud</span>
        <span class="deco-icon i3 material-symbols-outlined">ac_unit</span>
        <span class="deco-icon i4 material-symbols-outlined">filter_drama</span>
        <div class="hero-content">
          <div class="hero-icon">
            <span class="material-symbols-outlined">checkroom</span>
          </div>
          <h1 class="hero-title">오늘 뭐 입지?</h1>
          <p class="hero-desc">날씨에 맞는 오늘의 코디, AI가 추천해드려요</p>
        </div>
        <div class="brand-footer">ATMOSPHERIC CURATOR</div>
      </section>
    `;
  }

  #renderGoogleBtn() {
    return html`
      <button class="google-btn" @click=${this.#handleGoogle}>
        <svg class="google-logo" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 시작하기
      </button>
    `;
  }

  #renderLogin() {
    const error = this.#error.value;
    return html`
      ${this.#renderDesktopPanel()}

      <!-- Mobile Hero -->
      <section class="mobile-hero login">
        <div class="deco-1"></div>
        <div class="deco-2"></div>
        <div class="hero-content">
          <div class="hero-icon">
            <span class="material-symbols-outlined">checkroom</span>
          </div>
          <h1 class="hero-title">오늘 뭐 입지?</h1>
          <p class="hero-desc">날씨에 맞는 오늘의 코디, AI가 추천해드려요</p>
        </div>
      </section>

      <div class="right-panel">
        <main class="card-wrap login">
          <div class="card">
            <div class="form-header">
              <h2>로그인</h2>
              <p>계정에 로그인하여 오늘의 코디를 확인하세요</p>
            </div>

            ${this.#renderInAppBanner()}
            ${this.#renderGoogleBtn()}
            <div class="divider"><span>또는</span></div>

            <form class="form" @submit=${this.#handleSubmit}>
              <dc-input type="email" label="이메일" placeholder="example@email.com"
                .value=${this._email} @dc-input=${(e) => (this._email = e.detail)}></dc-input>
              <dc-input type="password" label="비밀번호" placeholder="비밀번호 입력"
                .value=${this._password} @dc-input=${(e) => (this._password = e.detail)}></dc-input>
              ${error ? html`<div class="error-box">${error}</div>` : ''}
              <div class="submit-btn">
                <dc-button variant="primary" ?loading=${this._submitting}
                  @click=${this.#handleSubmit}>로그인</dc-button>
              </div>
            </form>

            <div class="switch-link">
              계정이 없으신가요?
              <a @click=${() => this.#switchMode('signup')}>회원가입</a>
            </div>
          </div>
        </main>
        <footer class="footer">
          <p>계속 진행하면 <u>이용약관</u> 및 <u>개인정보처리방침</u>에 동의하는 것으로 간주됩니다</p>
        </footer>
      </div>
    `;
  }

  #renderSignup() {
    const error = this.#error.value;
    return html`
      ${this.#renderDesktopPanel()}

      <!-- Mobile Hero -->
      <section class="mobile-hero signup">
        <div class="deco-1"></div>
        <div class="deco-2"></div>
        <button class="back-btn" @click=${() => this.#switchMode('login')}>
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div class="hero-content">
          <h1 class="hero-title signup">회원가입</h1>
          <p class="hero-desc">간단한 정보만 입력하면 바로 시작할 수 있어요</p>
        </div>
      </section>

      <div class="right-panel">
        <button class="desktop-back back-btn" @click=${() => this.#switchMode('login')}>
          <span class="material-symbols-outlined" style="color: var(--dc-text-secondary)">arrow_back</span>
        </button>
        <main class="card-wrap signup">
          <div class="card">
            <div class="form-header">
              <h2>회원가입</h2>
              <p>간단한 정보만 입력하면 바로 시작할 수 있어요</p>
            </div>

            <form class="form" @submit=${this.#handleSubmit}>
              <dc-input type="email" label="이메일" placeholder="example@email.com"
                .value=${this._email} @dc-input=${(e) => (this._email = e.detail)}></dc-input>
              <dc-input type="password" label="비밀번호" placeholder="8자 이상 입력하세요"
                .value=${this._password} @dc-input=${(e) => (this._password = e.detail)}></dc-input>
              <dc-input type="password" label="비밀번호 확인" placeholder="비밀번호를 다시 입력하세요"
                .value=${this._passwordConfirm} @dc-input=${(e) => (this._passwordConfirm = e.detail)}></dc-input>
              ${error ? html`<div class="error-box">${error}</div>` : ''}
              ${this._message ? html`<div class="success-box">${this._message}</div>` : ''}
              <div class="submit-btn">
                <dc-button variant="primary" ?loading=${this._submitting}
                  @click=${this.#handleSubmit}>회원가입</dc-button>
              </div>
            </form>

            <div class="switch-link">
              이미 계정이 있으신가요?
              <a @click=${() => this.#switchMode('login')}>로그인</a>
            </div>
          </div>
        </main>
        <footer class="footer">
          <p>가입 시 <u>이용약관</u> 및 <u>개인정보처리방침</u>에 동의하게 됩니다</p>
        </footer>
      </div>
    `;
  }
}

customElements.define('login-page', LoginPage);
