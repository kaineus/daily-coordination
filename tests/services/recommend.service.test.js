import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWeather, getRecommendation, getRecommendationWithRefresh } from '../../src/services/recommend.service.js';

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
  });
});
