import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWeather, getRecommendation, getRecommendationWithRefresh, getGeneralRecommendation, getGeneralRecommendationWithRefresh } from '../../src/services/recommend.service.js';

function createMockSupabase(session = null) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
  };
}

describe('recommend.service', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('getWeather', () => {
    it('성공 → { data, error: null }', async () => {
      const mockData = { current: { temp: 15 } };
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await getWeather();
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('weather'),
        expect.any(Object),
      );
    });

    it('실패 → { data: null, error }', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'error' }),
      });

      const result = await getWeather();
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('네트워크 에러 (fetch throw) → { data: null, error }', async () => {
      globalThis.fetch.mockRejectedValue(new Error('Network failure'));
      const result = await getWeather();
      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Network failure');
    });
  });

  describe('getRecommendation', () => {
    it('미로그인 → 인증 필요 에러', async () => {
      const supabase = createMockSupabase(null);
      const result = await getRecommendation(supabase);
      expect(result.error.message).toBe('인증 필요');
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('로그인 → Authorization 헤더로 fetch', async () => {
      const session = { access_token: 'abc-123' };
      const supabase = createMockSupabase(session);
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      const result = await getRecommendation(supabase);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('recommend'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer abc-123',
          }),
        }),
      );
      expect(result.data).toEqual({ items: [] });
    });

    it('fetch 실패 → error 반환', async () => {
      const supabase = createMockSupabase({ access_token: 'tok' });
      globalThis.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'fail' }),
      });

      const result = await getRecommendation(supabase);
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('네트워크 에러 (fetch throw) → { data: null, error }', async () => {
      const supabase = createMockSupabase({ access_token: 'tok' });
      globalThis.fetch.mockRejectedValue(new Error('Failed to fetch'));
      const result = await getRecommendation(supabase);
      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Failed to fetch');
    });
  });

  describe('getRecommendationWithRefresh', () => {
    it('미로그인 → 인증 필요', async () => {
      const supabase = createMockSupabase(null);
      const result = await getRecommendationWithRefresh(supabase);
      expect(result.error.message).toBe('인증 필요');
    });

    it('?refresh=true 쿼리 파라미터 포함', async () => {
      const supabase = createMockSupabase({ access_token: 'tok' });
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await getRecommendationWithRefresh(supabase);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('refresh=true'),
        expect.any(Object),
      );
    });

    it('네트워크 에러 (fetch throw) → { data: null, error }', async () => {
      const supabase = createMockSupabase({ access_token: 'tok' });
      globalThis.fetch.mockRejectedValue(new Error('timeout'));
      const result = await getRecommendationWithRefresh(supabase);
      expect(result.data).toBeNull();
      expect(result.error.message).toBe('timeout');
    });
  });

  // --- F8: 일반 코디 추천 (비인증) ---

  describe('getGeneralRecommendation', () => {
    it('성공 → { data, error: null }', async () => {
      const mockData = { items: [{ type: '상의', imageUrl: 'https://example.com/img.jpg' }] };
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await getGeneralRecommendation();
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('recommend-general'),
        expect.any(Object),
      );
    });

    it('인증 없이 호출 (supabase 불필요)', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await getGeneralRecommendation();
      const callArgs = globalThis.fetch.mock.calls[0][1];
      expect(callArgs.headers).not.toHaveProperty('Authorization');
    });

    it('서버 에러 → { data: null, error }', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'server error' }),
      });

      const result = await getGeneralRecommendation();
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('네트워크 에러 (fetch throw) → { data: null, error }', async () => {
      globalThis.fetch.mockRejectedValue(new Error('Network offline'));
      const result = await getGeneralRecommendation();
      expect(result.data).toBeNull();
      expect(result.error.message).toBe('Network offline');
    });
  });

  describe('getGeneralRecommendationWithRefresh', () => {
    it('?refresh=true 쿼리 파라미터 포함', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await getGeneralRecommendationWithRefresh();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('refresh=true'),
        expect.any(Object),
      );
    });

    it('recommend-general 엔드포인트 호출', async () => {
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await getGeneralRecommendationWithRefresh();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('recommend-general'),
        expect.any(Object),
      );
    });

    it('네트워크 에러 → { data: null, error }', async () => {
      globalThis.fetch.mockRejectedValue(new Error('timeout'));
      const result = await getGeneralRecommendationWithRefresh();
      expect(result.data).toBeNull();
      expect(result.error.message).toBe('timeout');
    });
  });
});
