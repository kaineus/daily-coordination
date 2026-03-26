import { describe, it, expect } from 'vitest';
import { COLOR_PRESETS } from '../../src/constants/colors.js';

describe('COLOR_PRESETS', () => {
  it('25개 프리셋', () => {
    expect(COLOR_PRESETS).toHaveLength(25);
  });

  it('모든 항목에 name, hex 존재', () => {
    for (const preset of COLOR_PRESETS) {
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('hex');
      expect(typeof preset.name).toBe('string');
      expect(typeof preset.hex).toBe('string');
    }
  });

  it('hex 형식 유효 (#XXXXXX)', () => {
    for (const { name, hex } of COLOR_PRESETS) {
      expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('name 중복 없음', () => {
    const names = COLOR_PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('hex 중복 없음', () => {
    const hexes = COLOR_PRESETS.map((p) => p.hex.toLowerCase());
    expect(new Set(hexes).size).toBe(hexes.length);
  });

  it('requirements.md 기준 주요 색상 포함', () => {
    const names = COLOR_PRESETS.map((p) => p.name);
    const required = ['검정', '흰색', '베이지', '네이비', '빨강', '노랑'];
    for (const r of required) {
      expect(names).toContain(r);
    }
  });

  it('검정 hex = #333333', () => {
    const black = COLOR_PRESETS.find((p) => p.name === '검정');
    expect(black.hex).toBe('#333333');
  });
});
