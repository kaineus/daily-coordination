/**
 * F2 2depth 그룹 표시 테스트
 * type > category 서브그룹 구조 검증
 */
import { describe, it, expect } from 'vitest';
import { groupByCategory } from '../../src/utils/closet-grouping.js';

const mockClothes = [
  // 아우터: 패딩 2개, 코트 1개
  { id: '1', color: '#333333', color_name: '검정', category: { name: '패딩', type: '아우터', icon: '🧥' } },
  { id: '2', color: '#1E3A8A', color_name: '네이비', category: { name: '패딩', type: '아우터', icon: '🧥' } },
  { id: '3', color: '#4B3621', color_name: '브라운', category: { name: '코트', type: '아우터', icon: '🧥' } },
  // 상의: 니트 1개, 셔츠 2개
  { id: '4', color: '#F5E6D3', color_name: '베이지', category: { name: '니트', type: '상의', icon: '🧶' } },
  { id: '5', color: '#FFFFFF', color_name: '흰색', category: { name: '셔츠', type: '상의', icon: '👔' } },
  { id: '6', color: '#87CEEB', color_name: '스카이블루', category: { name: '셔츠', type: '상의', icon: '👔' } },
  // 하의: 슬랙스 1개
  { id: '7', color: '#333333', color_name: '검정', category: { name: '슬랙스', type: '하의', icon: '👖' } },
  // 신발: 운동화 1개
  { id: '8', color: '#FFFFFF', color_name: '흰색', category: { name: '운동화', type: '신발', icon: '👟' } },
];

describe('F2 2depth 그룹 구조', () => {
  it('1depth: TYPE_ORDER 순서대로 그룹', () => {
    const result = groupByCategory(mockClothes);
    expect(result.map((g) => g.type)).toEqual(['아우터', '상의', '하의', '신발']);
  });

  it('2depth: 아우터 → 패딩(2), 코트(1) 서브그룹', () => {
    const result = groupByCategory(mockClothes);
    const outer = result.find((g) => g.type === '아우터');

    expect(outer.subGroups).toHaveLength(2);

    const padding = outer.subGroups.find((s) => s.name === '패딩');
    expect(padding.items).toHaveLength(2);

    const coat = outer.subGroups.find((s) => s.name === '코트');
    expect(coat.items).toHaveLength(1);
  });

  it('2depth: 상의 → 니트(1), 셔츠(2) 서브그룹', () => {
    const result = groupByCategory(mockClothes);
    const tops = result.find((g) => g.type === '상의');

    expect(tops.subGroups).toHaveLength(2);
    expect(tops.subGroups.find((s) => s.name === '니트').items).toHaveLength(1);
    expect(tops.subGroups.find((s) => s.name === '셔츠').items).toHaveLength(2);
  });

  it('2depth: 하의 → 슬랙스(1) 단일 서브그룹', () => {
    const result = groupByCategory(mockClothes);
    const bottoms = result.find((g) => g.type === '하의');

    expect(bottoms.subGroups).toHaveLength(1);
    expect(bottoms.subGroups[0].name).toBe('슬랙스');
  });

  it('서브그룹 items에 원본 데이터 보존', () => {
    const result = groupByCategory(mockClothes);
    const outer = result.find((g) => g.type === '아우터');
    const paddingSub = outer.subGroups.find((s) => s.name === '패딩');

    // 각 아이템에 color, color_name 등 원본 필드가 있어야 함
    for (const item of paddingSub.items) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('color');
      expect(item).toHaveProperty('color_name');
      expect(item.category.name).toBe('패딩');
    }
  });

  it('아이템 표시명 조합 가능: "색상명 + 카테고리명"', () => {
    const result = groupByCategory(mockClothes);
    const outer = result.find((g) => g.type === '아우터');
    const paddingSub = outer.subGroups.find((s) => s.name === '패딩');

    const displayNames = paddingSub.items.map((i) => `${i.color_name} ${i.category.name}`);
    expect(displayNames).toContain('검정 패딩');
    expect(displayNames).toContain('네이비 패딩');
  });

  it('filterType 적용 시에도 2depth 유지', () => {
    const result = groupByCategory(mockClothes, '상의');
    expect(result).toHaveLength(1);
    expect(result[0].subGroups).toHaveLength(2);
  });

  it('전체 items 수 = 서브그룹 items 합산', () => {
    const result = groupByCategory(mockClothes);
    for (const group of result) {
      const totalFromSub = group.subGroups.reduce((sum, s) => sum + s.items.length, 0);
      expect(group.items.length).toBe(totalFromSub);
    }
  });
});
