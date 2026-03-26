import { describe, it, expect } from 'vitest';
import { isWhiteColor } from '../../src/utils/color.js';

describe('isWhiteColor', () => {
  it('소문자 #ffffff → true', () => {
    expect(isWhiteColor('#ffffff')).toBe(true);
  });

  it('대문자 #FFFFFF → true', () => {
    expect(isWhiteColor('#FFFFFF')).toBe(true);
  });

  it('검정 #000000 → false', () => {
    expect(isWhiteColor('#000000')).toBe(false);
  });

  it('null → false', () => {
    expect(isWhiteColor(null)).toBe(false);
  });

  it('undefined → false', () => {
    expect(isWhiteColor(undefined)).toBe(false);
  });

  it('아이보리 #FFFFF0 → false (흰색 아님)', () => {
    expect(isWhiteColor('#FFFFF0')).toBe(false);
  });
});
