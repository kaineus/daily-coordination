import { describe, it, expect, vi, afterEach } from 'vitest';
import { getKSTHour } from '../../src/utils/timezone.js';

describe('getKSTHour', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UTC+9 기준 시간 반환 (0-23)', () => {
    // 2026-03-26 UTC 00:00 → KST 09:00
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-26T00:00:00Z').getTime());
    expect(getKSTHour()).toBe(9);
  });

  it('UTC 15:00 → KST 00:00 (다음날)', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-26T15:00:00Z').getTime());
    expect(getKSTHour()).toBe(0);
  });

  it('UTC 23:00 → KST 08:00', () => {
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-26T23:00:00Z').getTime());
    expect(getKSTHour()).toBe(8);
  });
});
