import { describe, it, expect } from 'vitest';
import { SVG_MAP } from '../../src/constants/svg-map.js';

// requirements.md 기준 30개 카테고리
const ALL_CATEGORIES = [
  // 아우터 (6)
  '패딩', '코트', '자켓', '가디건', '바람막이', '점퍼',
  // 상의 (7)
  '반팔티', '긴팔티', '맨투맨', '후드', '니트', '셔츠', '블라우스',
  // 하의 (6)
  '청바지', '슬랙스', '면바지', '기모바지', '반바지', '치마',
  // 신발 (5)
  '운동화', '구두', '부츠', '샌들', '슬리퍼',
  // 액세서리 (4)
  '모자', '목도리', '장갑', '우산',
];

describe('SVG_MAP — 매핑 완전성', () => {
  it('28개 카테고리에 SVG 매핑 존재', () => {
    // SVG_MAP에 매핑된 카테고리 수 확인
    const mapped = ALL_CATEGORIES.filter((name) => SVG_MAP[name]);
    expect(mapped.length).toBe(Object.keys(SVG_MAP).length);
  });

  it.each(ALL_CATEGORIES)('%s — SVG_MAP에 존재', (name) => {
    expect(SVG_MAP[name]).toBeTruthy();
  });
});

describe('SVG_MAP — SVG 유효성', () => {
  it('모든 값이 <svg를 포함하는 문자열', () => {
    for (const [name, svg] of Object.entries(SVG_MAP)) {
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
    }
  });

  it('모든 SVG가 currentColor 사용', () => {
    for (const [name, svg] of Object.entries(SVG_MAP)) {
      expect(svg.toLowerCase()).toContain('currentcolor');
    }
  });
});
