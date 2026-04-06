import { describe, it, expect, beforeEach } from 'vitest';
import { recommendStore } from '../../src/store/recommend.store.js';

const mockWeather = {
  current: { temp: 12, sky: '맑음' },
  hourly: [
    { time: '06:00', temp: 8 },
    { time: '09:00', temp: 12 },
  ],
};
const mockRec = { summary: '오늘은 따뜻하게', items: [] };

describe('recommendStore', () => {
  beforeEach(() => {
    recommendStore.actions.clear();
  });

  it('초기 상태', () => {
    const s = recommendStore.getState();
    expect(s.weather).toBeNull();
    expect(s.hourly).toEqual([]);
    expect(s.recommendation).toBeNull();
    expect(s.mode).toBeNull();
    expect(s.loading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('setWeather → weather + hourly 파생', () => {
    recommendStore.actions.setWeather(mockWeather);
    const s = recommendStore.getState();
    expect(s.weather).toBe(mockWeather);
    expect(s.hourly).toEqual(mockWeather.hourly);
  });

  it('setWeather(null) → hourly 빈 배열', () => {
    recommendStore.actions.setWeather(null);
    expect(recommendStore.getState().hourly).toEqual([]);
  });

  it('setRecommendation', () => {
    recommendStore.actions.setRecommendation(mockRec);
    expect(recommendStore.getState().recommendation).toBe(mockRec);
  });

  it('setData → weather + recommendation 동시 설정', () => {
    recommendStore.actions.setData(mockWeather, mockRec);
    const s = recommendStore.getState();
    expect(s.weather).toBe(mockWeather);
    expect(s.recommendation).toBe(mockRec);
    expect(s.hourly).toEqual(mockWeather.hourly);
    expect(s.error).toBeNull();
  });

  it('setData(null, null) → hourly 빈 배열', () => {
    recommendStore.actions.setData(null, null);
    const s = recommendStore.getState();
    expect(s.weather).toBeNull();
    expect(s.hourly).toEqual([]);
    expect(s.recommendation).toBeNull();
    expect(s.error).toBeNull();
  });

  it('setLoading / setError', () => {
    recommendStore.actions.setLoading(true);
    expect(recommendStore.getState().loading).toBe(true);
    recommendStore.actions.setError('에러');
    expect(recommendStore.getState().error).toBe('에러');
  });

  it('clear → 모든 필드 초기화', () => {
    recommendStore.actions.setData(mockWeather, mockRec);
    recommendStore.actions.setMode('general');
    recommendStore.actions.clear();
    const s = recommendStore.getState();
    expect(s.weather).toBeNull();
    expect(s.hourly).toEqual([]);
    expect(s.recommendation).toBeNull();
    expect(s.mode).toBeNull();
  });

  // --- F8: mode 필드 ---

  it('setMode("general")', () => {
    recommendStore.actions.setMode('general');
    expect(recommendStore.getState().mode).toBe('general');
  });

  it('setMode("personal")', () => {
    recommendStore.actions.setMode('personal');
    expect(recommendStore.getState().mode).toBe('personal');
  });

  it('setMode(null) → 초기화', () => {
    recommendStore.actions.setMode('general');
    recommendStore.actions.setMode(null);
    expect(recommendStore.getState().mode).toBeNull();
  });
});
