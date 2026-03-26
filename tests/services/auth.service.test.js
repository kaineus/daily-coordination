import { describe, it, expect, vi } from 'vitest';
import { signInWithGoogle, signOut, initAuth } from '../../src/services/auth.service.js';

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
