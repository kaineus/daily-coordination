import { describe, it, expect, vi } from 'vitest';
import { signInWithGoogle, signOut, initAuth, fetchUserRole } from '../../src/services/auth.service.js';

function createMockSupabase({ session = null } = {}) {
  return {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  };
}

describe('signInWithGoogle', () => {
  it('signInWithOAuth를 google provider로 호출', async () => {
    const supabase = createMockSupabase();
    await signInWithGoogle(supabase);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' }),
    );
  });
});

describe('signOut', () => {
  it('supabase.auth.signOut() 호출', async () => {
    const supabase = createMockSupabase();
    await signOut(supabase);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});

describe('signUpWithEmail', () => {
  it('supabase.auth.signUp 호출', async () => {
    const { signUpWithEmail } = await import('../../src/services/auth.service.js');
    const supabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      },
    };
    const result = await signUpWithEmail(supabase, 'test@test.com', 'pw123');
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@test.com', password: 'pw123' }),
    );
    expect(result.data).toBeTruthy();
    expect(result.error).toBeNull();
  });
});

describe('signInWithEmail', () => {
  it('supabase.auth.signInWithPassword 호출', async () => {
    const { signInWithEmail } = await import('../../src/services/auth.service.js');
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      },
    };
    const result = await signInWithEmail(supabase, 'test@test.com', 'pw123');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pw123',
    });
    expect(result.error).toBeNull();
  });

  it('잘못된 비밀번호 → error 반환', async () => {
    const { signInWithEmail } = await import('../../src/services/auth.service.js');
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } }),
      },
    };
    const result = await signInWithEmail(supabase, 'test@test.com', 'wrong');
    expect(result.error.message).toBe('Invalid credentials');
  });
});

// --- F6 RBAC: fetchUserRole ---

describe('fetchUserRole', () => {
  it('TC-F6-006: admin 사용자 → "admin" 반환', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      }),
    };
    const role = await fetchUserRole(supabase);
    expect(role).toBe('admin');
    expect(supabase.from).toHaveBeenCalledWith('user_profiles');
  });

  it('TC-F6-007: user 사용자 → "user" 반환', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u2' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
      }),
    };
    expect(await fetchUserRole(supabase)).toBe('user');
  });

  it('TC-F6-008: 미로그인 (user null) → "user" 폴백', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    };
    expect(await fetchUserRole(supabase)).toBe('user');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('TC-F6-009: user_profiles 조회 에러 → "user" 폴백 + console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u3' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      }),
    };
    expect(await fetchUserRole(supabase)).toBe('user');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('TC-F6-010: user_profiles 행 없음 (single 에러) → "user" 폴백', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u4' } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
      }),
    };
    expect(await fetchUserRole(supabase)).toBe('user');
    spy.mockRestore();
  });
});

describe('initAuth', () => {
  it('현재 세션 확인 후 콜백 호출', async () => {
    const session = { user: { id: 'u1' } };
    const supabase = createMockSupabase({ session });
    const onSessionChange = vi.fn();

    initAuth(supabase, onSessionChange);

    // getSession은 Promise이므로 microtask 대기
    await vi.waitFor(() => {
      expect(onSessionChange).toHaveBeenCalledWith(session);
    });
  });

  it('onAuthStateChange 리스너 등록', () => {
    const supabase = createMockSupabase();
    const onSessionChange = vi.fn();

    initAuth(supabase, onSessionChange);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it('subscription 반환', () => {
    const supabase = createMockSupabase();
    const result = initAuth(supabase, vi.fn());
    expect(result).toHaveProperty('unsubscribe');
  });
});
