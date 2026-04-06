import { describe, it, expect } from 'vitest';
import { normalizeOutfitItems } from '../../src/utils/recommendation.js';

describe('normalizeOutfitItems', () => {
  it('items + accessories를 하나의 배열로 병합', () => {
    const rec = {
      items: [
        { type: '아우터', category: '패딩', color: '#333333', colorName: '검정', reason: '추움' },
        { type: '상의', category: '니트', color: '#F5E6D3', colorName: '베이지', reason: '보온' },
      ],
      accessories: [
        { type: '액세서리', category: '목도리', color: '#808080', colorName: '회색', reason: '방한' },
      ],
    };

    const result = normalizeOutfitItems(rec);
    expect(result).toHaveLength(3);
  });

  it('프로퍼티명 매핑 정확성', () => {
    const rec = {
      items: [{ type: '아우터', category: '패딩', color: '#333333', colorName: '검정', reason: '추움' }],
    };

    const result = normalizeOutfitItems(rec);
    expect(result[0]).toEqual({
      category: '아우터',   // type → category
      name: '패딩',         // category → name
      colorHex: '#333333',  // color → colorHex
      colorName: '검정',
      reason: '추움',
      imageUrl: null,
    });
  });

  it('null 입력 → 빈 배열', () => {
    expect(normalizeOutfitItems(null)).toEqual([]);
  });

  it('undefined 입력 → 빈 배열', () => {
    expect(normalizeOutfitItems(undefined)).toEqual([]);
  });

  it('items만 있고 accessories 없음 → items만 반환', () => {
    const rec = {
      items: [{ type: '상의', category: '셔츠', color: '#FFFFFF', colorName: '흰색', reason: '깔끔' }],
    };
    const result = normalizeOutfitItems(rec);
    expect(result).toHaveLength(1);
  });

  it('accessories만 있고 items 없음', () => {
    const rec = {
      accessories: [{ type: '액세서리', category: '우산', color: '#1E3A8A', colorName: '네이비', reason: '비' }],
    };
    const result = normalizeOutfitItems(rec);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('우산');
  });

  it('빈 items + 빈 accessories', () => {
    expect(normalizeOutfitItems({ items: [], accessories: [] })).toEqual([]);
  });

  // --- F8: imageUrl 패스스루 ---

  it('imageUrl 있는 아이템 → imageUrl 유지', () => {
    const rec = {
      items: [{ type: '상의', category: '셔츠', color: '#FFF', colorName: '흰색', reason: '깔끔', imageUrl: 'https://images.pexels.com/photo.jpg' }],
    };
    const result = normalizeOutfitItems(rec);
    expect(result[0].imageUrl).toBe('https://images.pexels.com/photo.jpg');
  });

  it('imageUrl 없는 아이템 → imageUrl: null', () => {
    const rec = {
      items: [{ type: '상의', category: '셔츠', color: '#FFF', colorName: '흰색', reason: '깔끔' }],
    };
    const result = normalizeOutfitItems(rec);
    expect(result[0].imageUrl).toBeNull();
  });
});
