/**
 * 프론트엔드 ↔ Edge Function 색상 프리셋 일관성 검증
 * 양쪽이 동일한 25개 프리셋을 사용해야 함
 */
import { describe, it, expect } from 'vitest';
import { COLOR_PRESETS } from '../../src/constants/colors.js';

// Edge Function의 COLOR_PRESETS (chat-register/index.ts에서 복제)
const EDGE_COLOR_PRESETS = [
  { name: '검정', hex: '#333333' },
  { name: '흰색', hex: '#FFFFFF' },
  { name: '아이보리', hex: '#FFFFF0' },
  { name: '회색', hex: '#808080' },
  { name: '차콜', hex: '#555555' },
  { name: '크림', hex: '#FFFDD0' },
  { name: '베이지', hex: '#F5E6D3' },
  { name: '브라운', hex: '#4B3621' },
  { name: '카키', hex: '#8B7D5B' },
  { name: '올리브', hex: '#6B8E23' },
  { name: '네이비', hex: '#1E3A8A' },
  { name: '데님', hex: '#1560BD' },
  { name: '스카이블루', hex: '#87CEEB' },
  { name: '파랑', hex: '#4488FF' },
  { name: '민트', hex: '#34D399' },
  { name: '초록', hex: '#44BB44' },
  { name: '빨강', hex: '#FF4444' },
  { name: '버건디', hex: '#800020' },
  { name: '와인', hex: '#722F37' },
  { name: '코랄', hex: '#FF7F7F' },
  { name: '분홍', hex: '#FF88AA' },
  { name: '라벤더', hex: '#B4A7D6' },
  { name: '주황', hex: '#FF8844' },
  { name: '머스타드', hex: '#E1AD01' },
  { name: '노랑', hex: '#FFCC00' },
];

describe('색상 프리셋 일관성 (Frontend ↔ Edge Function)', () => {
  it('동일한 개수', () => {
    expect(COLOR_PRESETS.length).toBe(EDGE_COLOR_PRESETS.length);
  });

  it('모든 name 일치', () => {
    const frontNames = COLOR_PRESETS.map((p) => p.name);
    const edgeNames = EDGE_COLOR_PRESETS.map((p) => p.name);
    expect(frontNames).toEqual(edgeNames);
  });

  it('모든 hex 일치', () => {
    const frontHexes = COLOR_PRESETS.map((p) => p.hex);
    const edgeHexes = EDGE_COLOR_PRESETS.map((p) => p.hex);
    expect(frontHexes).toEqual(edgeHexes);
  });

  it('순서 일치', () => {
    expect(COLOR_PRESETS).toEqual(EDGE_COLOR_PRESETS);
  });
});
