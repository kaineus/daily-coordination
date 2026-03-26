import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '../../src/store/auth.store.js';

const mockSession = {
  access_token: 'token-123',
  user: { id: 'user-1', email: 'test@example.com' },
};

describe('authStore', () => {
  beforeEach(() => {
    authStore.actions.clear();
  });

  it('초기 상태', () => {
    const state = authStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(false); // clear 후
    expect(state.error).toBeNull();
  });

  it('setSession → user, session, loading 설정', () => {
    authStore.actions.setSession(mockSession);
    const state = authStore.getState();
    expect(state.session).toBe(mockSession);
    expect(state.user).toBe(mockSession.user);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setSession(null) → user null', () => {
    authStore.actions.setSession(null);
    const state = authStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
  });

  it('clear → 모든 필드 초기화', () => {
    authStore.actions.setSession(mockSession);
    authStore.actions.clear();
    const state = authStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setError → error 설정', () => {
    authStore.actions.setError('인증 실패');
    expect(authStore.getState().error).toBe('인증 실패');
  });

  it('clearError → error만 null로', () => {
    authStore.actions.setError('에러');
    authStore.actions.clearError();
    expect(authStore.getState().error).toBeNull();
  });

  it('setLoading', () => {
    authStore.actions.setLoading(true);
    expect(authStore.getState().loading).toBe(true);
  });

  // --- F6 RBAC: role 관리 ---

  it('TC-F6-005: 초기 상태 role === null', () => {
    expect(authStore.getState().role).toBeNull();
  });

  it('TC-F6-001: setRole("admin")', () => {
    authStore.actions.setRole('admin');
    expect(authStore.getState().role).toBe('admin');
  });

  it('TC-F6-002: setRole("user")', () => {
    authStore.actions.setRole('user');
    expect(authStore.getState().role).toBe('user');
  });

  it('TC-F6-003: setRole(null) — 로그아웃 시', () => {
    authStore.actions.setRole('admin');
    authStore.actions.setRole(null);
    expect(authStore.getState().role).toBeNull();
  });

  it('TC-F6-004: clear() → role도 null', () => {
    authStore.actions.setRole('admin');
    authStore.actions.clear();
    expect(authStore.getState().role).toBeNull();
  });

  it('setSession은 role을 변경하지 않음', () => {
    authStore.actions.setRole('admin');
    authStore.actions.setSession(mockSession);
    expect(authStore.getState().role).toBe('admin');
  });
});
