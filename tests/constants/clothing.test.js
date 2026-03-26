import { describe, it, expect } from 'vitest';
import { TYPE_ORDER, TYPE_ICONS, TYPE_EMOJI, CATEGORY_COLORS, TYPE_MATERIAL_ICONS } from '../../src/constants/clothing.js';

describe('TYPE_ORDER', () => {
  it('5개 상위 분류', () => {
    expect(TYPE_ORDER).toEqual(['아우터', '상의', '하의', '신발', '액세서리']);
  });
});

describe('TYPE_ICONS', () => {
  it('모든 TYPE_ORDER에 대응하는 아이콘 존재', () => {
    for (const type of TYPE_ORDER) {
      expect(TYPE_ICONS[type]).toBeTruthy();
    }
  });
});

describe('TYPE_EMOJI', () => {
  it('모든 TYPE_ORDER에 대응하는 이모지 존재', () => {
    for (const type of TYPE_ORDER) {
      expect(TYPE_EMOJI[type]).toBeTruthy();
    }
  });

  it('이모지 값 정확성', () => {
    expect(TYPE_EMOJI['아우터']).toBe('🧥');
    expect(TYPE_EMOJI['상의']).toBe('👕');
    expect(TYPE_EMOJI['하의']).toBe('👖');
    expect(TYPE_EMOJI['신발']).toBe('👟');
    expect(TYPE_EMOJI['액세서리']).toBe('🎩');
  });
});

describe('CATEGORY_COLORS', () => {
  it('모든 TYPE_ORDER에 대응하는 bg, color 존재', () => {
    for (const type of TYPE_ORDER) {
      expect(CATEGORY_COLORS[type]).toHaveProperty('bg');
      expect(CATEGORY_COLORS[type]).toHaveProperty('color');
    }
  });

  it('hex 형식 유효', () => {
    for (const { bg, color } of Object.values(CATEGORY_COLORS)) {
      expect(bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('TYPE_MATERIAL_ICONS', () => {
  it('모든 TYPE_ORDER에 대응', () => {
    for (const type of TYPE_ORDER) {
      expect(TYPE_MATERIAL_ICONS[type]).toBeTruthy();
    }
  });
});
