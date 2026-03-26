import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendChatMessage } from '../../src/services/chat.service.js';

function createMockSupabase(session = null) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
  };
}

describe('sendChatMessage', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('미로그인 → 에러 반환', async () => {
    const supabase = createMockSupabase(null);
    const result = await sendChatMessage(supabase, [{ role: 'user', content: '검정 패딩' }]);
    expect(result.data).toBeNull();
    expect(result.error.message).toBe('인증 필요');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('로그인 상태 → fetch 호출 + Authorization 헤더', async () => {
    const session = { access_token: 'tok-123' };
    const supabase = createMockSupabase(session);
    const mockResponse = { message: '등록할게요', items: [] };

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await sendChatMessage(supabase, [{ role: 'user', content: '검정 패딩' }]);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('chat-register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer tok-123',
        }),
      }),
    );
    expect(result.data).toEqual(mockResponse);
    expect(result.error).toBeNull();
  });

  it('fetch 실패 → error 반환', async () => {
    const session = { access_token: 'tok-123' };
    const supabase = createMockSupabase(session);

    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Internal Error' }),
    });

    const result = await sendChatMessage(supabase, [{ role: 'user', content: '검정 패딩' }]);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});
