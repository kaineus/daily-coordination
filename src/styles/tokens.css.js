import { css } from 'lit';

export const tokens = css`
  :host {
    /* ========== Colors — DESIGN.md 기반 ========== */

    /* Brand */
    --dc-primary: #005EA1;
    --dc-primary-container: #2B78BF;
    --dc-primary-light: #D2E4FF;
    --dc-on-primary: #FFFFFF;
    --dc-primary-hover: #00497E;

    --dc-secondary: #FF6B6B;
    --dc-secondary-dark: #AE2F34;

    --dc-tertiary: #7B5500;

    /* Surfaces */
    --dc-bg: #F9F9FD;
    --dc-surface: #F9F9FD;
    --dc-surface-low: #F3F3F7;
    --dc-surface-container: #EDEDF1;
    --dc-surface-high: #E8E8EC;
    --dc-surface-lowest: #FFFFFF;

    /* Text */
    --dc-text: #1A1C1F;
    --dc-text-secondary: #414751;
    --dc-outline: #717782;
    --dc-outline-variant: #C1C7D2;

    /* Semantic */
    --dc-danger: #BA1A1A;
    --dc-success: #4CAF50;
    --dc-warning: #FFC107;
    --dc-error-container: #FFDAD6;

    /* Alias */
    --dc-border: #C1C7D2;

    /* ========== Typography ========== */
    --dc-font-headline: 'Manrope', sans-serif;
    --dc-font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;

    --dc-font-display: 1.75rem;
    --dc-font-h1: 1.5rem;
    --dc-font-h2: 1.25rem;
    --dc-font-title: 1rem;
    --dc-font-body: 0.875rem;
    --dc-font-caption: 0.75rem;
    --dc-font-tiny: 0.625rem;

    /* Aliases (기존 호환) */
    --dc-font-sm: 0.875rem;
    --dc-font-md: 1rem;
    --dc-font-lg: 1.25rem;
    --dc-font-xl: 1.5rem;
    --dc-font-2xl: 1.75rem;

    /* ========== Spacing — 8px(0.5rem) 기반 ========== */
    --dc-space-0-5: 0.125rem;
    --dc-space-1: 0.25rem;
    --dc-space-2: 0.5rem;
    --dc-space-3: 0.75rem;
    --dc-space-4: 1rem;
    --dc-space-5: 1.25rem;
    --dc-space-6: 1.5rem;
    --dc-space-8: 2rem;
    --dc-space-10: 2.5rem;
    --dc-space-12: 3rem;
    --dc-space-16: 4rem;

    /* Aliases (기존 호환) */
    --dc-space-xs: 0.25rem;
    --dc-space-sm: 0.5rem;
    --dc-space-md: 1rem;
    --dc-space-lg: 1.5rem;
    --dc-space-xl: 2rem;
    --dc-space-2xl: 3rem;

    /* ========== Border Radius ========== */
    --dc-radius-sm: 0.5rem;
    --dc-radius-md: 0.75rem;
    --dc-radius-lg: 1rem;
    --dc-radius-xl: 1.5rem;
    --dc-radius-full: 9999px;

    /* ========== Shadows (px 허용 — 시각적 미세 조정) ========== */
    --dc-shadow-ambient: 0 20px 40px rgba(26, 28, 31, 0.06);
    --dc-shadow-sm: 0 1px 3px rgba(26, 28, 31, 0.04);
    --dc-shadow-md: 0 4px 8px rgba(26, 28, 31, 0.06);
    --dc-shadow-lg: 0 10px 20px rgba(26, 28, 31, 0.08);
    --dc-shadow-primary: 0 4px 12px rgba(0, 94, 161, 0.2);

    /* ========== Gradients ========== */
    --dc-gradient-hero: linear-gradient(135deg, #005EA1 0%, #2B78BF 100%);
    --dc-gradient-sunny: linear-gradient(135deg, #FFC107, #FF6B6B);
    --dc-gradient-cloudy: linear-gradient(135deg, #E8E8EC, #FFFFFF);
    --dc-gradient-rainy: linear-gradient(135deg, #005EA1, #717782);
    --dc-gradient-snowy: linear-gradient(135deg, #FFFFFF, #D2E4FF);

    /* ========== Component Sizes ========== */
    --dc-input-height: 3rem;
    --dc-button-min-height: 3rem;
    --dc-hero-height-login: 24.8rem;
    --dc-hero-height-signup: 13.8rem;
    --dc-card-max-width: 28rem;
    --dc-content-max-width: 30rem;
    --dc-content-max-width-lg: 72rem;
  }
`;
