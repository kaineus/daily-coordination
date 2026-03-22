import { unsafeCSS } from 'lit';

/**
 * 반응형 브레이크포인트
 * Lit css`` 내에서 바로 사용 가능 (unsafeCSS 래핑)
 *
 * 사용법: @media (min-width: ${bp.lg}) { ... }
 */
export const bp = {
  sm: unsafeCSS('640px'),
  md: unsafeCSS('768px'),
  lg: unsafeCSS('1024px'),
  xl: unsafeCSS('1280px'),
  fhd: unsafeCSS('1920px'),
};
