import { describe, it, expect } from 'vitest';
import { WEATHER_TYPES, SKY_ICONS } from '../../src/constants/weather.js';

const EXPECTED_TYPES = ['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'snowy', 'sleet'];

describe('WEATHER_TYPES', () => {
  it('6개 날씨 타입', () => {
    expect(Object.keys(WEATHER_TYPES)).toHaveLength(6);
  });

  it.each(EXPECTED_TYPES)('%s — gradient + icon 존재', (type) => {
    expect(WEATHER_TYPES[type]).toHaveProperty('gradient');
    expect(WEATHER_TYPES[type]).toHaveProperty('icon');
    expect(WEATHER_TYPES[type].gradient).toContain('linear-gradient');
  });
});

describe('SKY_ICONS', () => {
  it('6개 아이콘', () => {
    expect(Object.keys(SKY_ICONS)).toHaveLength(6);
  });

  it.each(EXPECTED_TYPES)('%s — icon + color 존재', (type) => {
    expect(SKY_ICONS[type]).toHaveProperty('icon');
    expect(SKY_ICONS[type]).toHaveProperty('color');
    expect(SKY_ICONS[type].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('WEATHER_TYPES와 SKY_ICONS 키 일치', () => {
    expect(Object.keys(WEATHER_TYPES).sort()).toEqual(Object.keys(SKY_ICONS).sort());
  });
});
