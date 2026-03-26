import { describe, it, expect } from 'vitest';
import { groupByCategory, groupByColor } from '../../src/utils/closet-grouping.js';

const mockClothes = [
  { id: '1', color: '#333333', color_name: '검정', category: { name: '패딩', type: '아우터', icon: '🧥' } },
  { id: '2', color: '#1E3A8A', color_name: '네이비', category: { name: '슬랙스', type: '하의', icon: '👖' } },
  { id: '3', color: '#F5E6D3', color_name: '베이지', category: { name: '니트', type: '상의', icon: '🧶' } },
  { id: '4', color: '#333333', color_name: '검정', category: { name: '구두', type: '신발', icon: '👞' } },
  { id: '5', color: '#333333', color_name: '검정', category: { name: '코트', type: '아우터', icon: '🧥' } },
];

describe('groupByCategory', () => {
  it('TYPE_ORDER 순서대로 그룹화', () => {
    const result = groupByCategory(mockClothes);
    const types = result.map((g) => g.type);
    expect(types).toEqual(['아우터', '상의', '하의', '신발']);
  });

  it('각 그룹에 올바른 아이템 포함', () => {
    const result = groupByCategory(mockClothes);
    const outerGroup = result.find((g) => g.type === '아우터');
    expect(outerGroup.items).toHaveLength(2);
  });

  it('subGroups로 카테고리명별 세분화', () => {
    const result = groupByCategory(mockClothes);
    const outerGroup = result.find((g) => g.type === '아우터');
    expect(outerGroup.subGroups).toHaveLength(2); // 패딩, 코트
    expect(outerGroup.subGroups.map((s) => s.name).sort()).toEqual(['코트', '패딩']);
  });

  it('filterType 적용 — 상의만', () => {
    const result = groupByCategory(mockClothes, '상의');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('상의');
    expect(result[0].items).toHaveLength(1);
  });

  it('빈 배열 → 빈 결과', () => {
    expect(groupByCategory([])).toEqual([]);
  });

  it('존재하지 않는 filterType → 빈 결과', () => {
    expect(groupByCategory(mockClothes, '없는타입')).toEqual([]);
  });

  it('category 없는 아이템 → "기타" 타입 (TYPE_ORDER에 없으므로 제외)', () => {
    const clothes = [{ id: '99', color: '#000', color_name: '검정', category: null }];
    const result = groupByCategory(clothes);
    expect(result).toEqual([]); // "기타"는 TYPE_ORDER에 없으므로 결과에 안 나옴
  });

  it('category.name 없는 아이템 → subGroup "기타"', () => {
    const clothes = [
      { id: '1', color: '#333', color_name: '검정', category: { type: '아우터', name: null } },
    ];
    const result = groupByCategory(clothes);
    expect(result[0].subGroups[0].name).toBe('기타');
  });

  it('emoji 포함', () => {
    const result = groupByCategory(mockClothes);
    expect(result[0].emoji).toBe('🧥');
  });
});

describe('groupByColor', () => {
  it('색상명 기준으로 그룹화', () => {
    const result = groupByColor(mockClothes);
    const names = result.map((g) => g.type).sort();
    expect(names).toEqual(['검정', '네이비', '베이지']);
  });

  it('검정 그룹에 3개 아이템', () => {
    const result = groupByColor(mockClothes);
    const black = result.find((g) => g.type === '검정');
    expect(black.items).toHaveLength(3);
    expect(black.colorHex).toBe('#333333');
  });

  it('color_name 없는 아이템 → "기타" 키', () => {
    const clothes = [{ id: '1', color: '#999', color_name: null }];
    const result = groupByColor(clothes);
    expect(result[0].type).toBe('기타');
  });

  it('빈 배열 → 빈 결과', () => {
    expect(groupByColor([])).toEqual([]);
  });
});
