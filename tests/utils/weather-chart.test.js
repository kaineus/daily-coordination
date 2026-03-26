import { describe, it, expect } from 'vitest';
import { buildBezierPath } from '../../src/utils/weather-chart.js';

describe('buildBezierPath', () => {
  it('정상 온도 배열 → 올바른 구조 반환', () => {
    const result = buildBezierPath([5, 8, 12, 10, 7]);
    expect(result).toHaveProperty('path');
    expect(result).toHaveProperty('fillPath');
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('minT', 5);
    expect(result).toHaveProperty('maxT', 12);
    expect(result).toHaveProperty('range', 7);
    expect(result).toHaveProperty('ySteps');
  });

  it('points 개수 = 입력 배열 길이', () => {
    const result = buildBezierPath([5, 8, 12, 10, 7]);
    expect(result.points).toHaveLength(5);
  });

  it('path가 M으로 시작', () => {
    const result = buildBezierPath([5, 8, 12]);
    expect(result.path).toMatch(/^M /);
  });

  it('fillPath가 Z로 끝남', () => {
    const result = buildBezierPath([5, 8, 12]);
    expect(result.fillPath).toMatch(/Z$/);
  });

  it('동일 온도 → range=1 (0 나누기 방지), 수평선', () => {
    const result = buildBezierPath([10, 10, 10]);
    expect(result.range).toBe(1);
    // 모든 점의 y가 동일해야 함
    const ys = result.points.map((p) => p.y);
    expect(new Set(ys).size).toBe(1);
  });

  it('단일 값 → 에러 없이 반환', () => {
    // n=1이면 n-1=0이므로 0/0 발생 가능
    const result = buildBezierPath([15]);
    expect(result.points).toHaveLength(1);
    expect(result.minT).toBe(15);
    expect(result.maxT).toBe(15);
  });

  it('음수 온도 포함 → 범위 정상 계산', () => {
    const result = buildBezierPath([-5, -2, 0, 3]);
    expect(result.minT).toBe(-5);
    expect(result.maxT).toBe(3);
    expect(result.range).toBe(8);
  });

  it('ySteps에 max, mid, min 포함', () => {
    const result = buildBezierPath([0, 10]);
    expect(result.ySteps).toEqual([10, 5, 0]);
  });

  it('커스텀 width/height 적용', () => {
    const result = buildBezierPath([0, 10], 500, 200);
    // 첫 점의 x는 padX(기본 44)
    expect(result.points[0].x).toBe(44);
    // 마지막 점의 x는 width - padX
    expect(result.points[1].x).toBe(500 - 44);
  });
});
