/**
 * F6 RBAC 통합 테스트 — fetchUserRole → authStore → 라우트 가드 흐름
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUserRole } from '../../src/services/auth.service.js';
import { authStore } from '../../src/store/auth.store.js';

function createMockSupabase(role) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: role != null ? { id: 'u1' } : null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(
        role != null
          ? { data: { role }, error: null }
          : { data: null, error: { message: 'not found' } },
      ),
    }),
  };
}

describe('F6 통합: fetchUserRole → authStore → 라우트 가드', () => {
  beforeEach(() => {
    authStore.actions.clear();
    window.location.hash = '';
  });

  afterEach(() => {
    window.location.hash = '';
  });

  it('TC-F6-011: admin 사용자 → role 저장 → /admin 접근 허용', async () => {
    const supabase = createMockSupabase('admin');
    const role = await fetchUserRole(supabase);
    authStore.actions.setRole(role);

    expect(authStore.getState().role).toBe('admin');

    // 라우트 가드 시뮬레이션
    window.location.hash = '#/admin/categories';
    const hash = window.location.hash.slice(1);
    const isAdmin = authStore.getState().role === 'admin';
    const shouldRedirect = hash.startsWith('/admin') && !isAdmin;

    expect(shouldRedirect).toBe(false); // 접근 허용
  });

  it('TC-F6-012: user 사용자 → /admin 접근 → 리다이렉트', async () => {
    const supabase = createMockSupabase('user');
    const role = await fetchUserRole(supabase);
    authStore.actions.setRole(role);

    expect(authStore.getState().role).toBe('user');

    window.location.hash = '#/admin/categories';
    const hash = window.location.hash.slice(1);
    const isAdmin = authStore.getState().role === 'admin';
    const shouldRedirect = hash.startsWith('/admin') && !isAdmin;

    expect(shouldRedirect).toBe(true); // 리다이렉트 필요
  });

  it('TC-F6-013: role=null (로딩 중) → /admin 접근 → 리다이렉트', () => {
    // clear() 후 role은 null
    expect(authStore.getState().role).toBeNull();

    window.location.hash = '#/admin/categories';
    const hash = window.location.hash.slice(1);
    const isAdmin = authStore.getState().role === 'admin';
    const shouldRedirect = hash.startsWith('/admin') && !isAdmin;

    expect(shouldRedirect).toBe(true); // null !== 'admin'
  });

  it('전체 흐름: 로그인 → role fetch → store 저장 → 가드 통과', async () => {
    // 1. 세션 설정
    const session = { access_token: 'tok', user: { id: 'u1' } };
    authStore.actions.setSession(session);
    expect(authStore.getState().user).toBeTruthy();

    // 2. role fetch
    const supabase = createMockSupabase('admin');
    const role = await fetchUserRole(supabase);

    // 3. store 저장
    authStore.actions.setRole(role);
    expect(authStore.getState().role).toBe('admin');

    // 4. 가드 통과
    const canAccess = authStore.getState().role === 'admin';
    expect(canAccess).toBe(true);
  });

  it('role fetch 실패 → "user" 폴백 → admin 접근 차단', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const supabase = createMockSupabase(null); // user=null
    const role = await fetchUserRole(supabase);
    authStore.actions.setRole(role);

    expect(authStore.getState().role).toBe('user');

    const canAccess = authStore.getState().role === 'admin';
    expect(canAccess).toBe(false);
    vi.restoreAllMocks();
  });
});
