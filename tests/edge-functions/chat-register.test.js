/**
 * chat-register Edge Function 파싱 로직 테스트
 *
 * Edge Function은 Deno 환경이라 직접 import 불가.
 * 순수 함수(buildSystemPrompt, toGeminiContents)를 로컬에 복제하여 테스트.
 * 원본 변경 시 동기화 필요.
 */
import { describe, it, expect } from 'vitest';

// --- 원본에서 복제한 순수 함수 ---

const COLOR_PRESETS = [
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

function buildSystemPrompt(categories) {
  const categoryList = categories.map(c =>
    `- id: "${c.id}", name: "${c.name}", type: "${c.type}", icon: "${c.icon}"`
  ).join('\n');

  const colorList = COLOR_PRESETS.map(c =>
    `- name: "${c.name}", hex: "${c.hex}"`
  ).join('\n');

  return `너는 옷 등록 도우미 AI다. 사용자가 자연어로 옷을 설명하면 카테고리와 색상을 파싱하여 구조화된 JSON으로 응답해.

## 유효 카테고리 목록 (반드시 이 중에서만 매칭)
${categoryList}

## 유효 색상 프리셋 (우선 매칭, 없으면 가장 가까운 프리셋 제안)
${colorList}

## 응답 규칙
1. 사용자 입력에서 옷 아이템(카테고리 + 색상)을 추출
2. 복수 아이템 동시 파싱 가능
3. 카테고리를 특정할 수 없으면 needsClarification: true + suggestions에 후보 카테고리 제시
4. 색상을 특정할 수 없으면 needsClarification: true로 되물어봐
5. 카테고리 목록에 없는 옷이면 가장 유사한 카테고리를 suggestions로 제안
6. 옷 등록과 무관한 입력이면 부드럽게 옷 등록 안내로 유도
7. message는 항상 친근한 한국어로

## 응답 JSON 형식 (반드시 이 형식으로만 응답)
{
  "message": "사용자에게 보여줄 친근한 메시지",
  "items": [
    { "categoryId": "uuid", "categoryName": "카테고리명", "categoryIcon": "이모지", "color": "#hex", "colorName": "색상명" }
  ],
  "needsClarification": false,
  "suggestions": []
}

- items: 파싱 성공한 아이템 배열 (없으면 빈 배열)
- needsClarification: 되물어야 하면 true
- suggestions: 되물을 때 선택지 배열 (문자열). 예: ["🧥 코트", "👕 니트", "🧶 가디건"]`;
}

function toGeminiContents(systemPrompt, messages) {
  const contents = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === 'assistant' ? 'model' : 'user';
    let text = msg.content;
    if (i === 0 && role === 'user') {
      text = `${systemPrompt}\n\n---\n사용자 입력: ${text}`;
    }
    contents.push({ role, parts: [{ text }] });
  }
  return contents;
}

// --- 테스트 ---

const mockCategories = [
  { id: 'cat-1', name: '패딩', type: '아우터', icon: '🧥' },
  { id: 'cat-2', name: '니트', type: '상의', icon: '🧶' },
  { id: 'cat-3', name: '슬랙스', type: '하의', icon: '👖' },
];

describe('buildSystemPrompt', () => {
  it('카테고리 목록 포함', () => {
    const prompt = buildSystemPrompt(mockCategories);
    expect(prompt).toContain('패딩');
    expect(prompt).toContain('니트');
    expect(prompt).toContain('슬랙스');
  });

  it('카테고리 id 포함', () => {
    const prompt = buildSystemPrompt(mockCategories);
    expect(prompt).toContain('cat-1');
  });

  it('색상 프리셋 25개 포함', () => {
    const prompt = buildSystemPrompt(mockCategories);
    for (const preset of COLOR_PRESETS) {
      expect(prompt).toContain(preset.name);
      expect(prompt).toContain(preset.hex);
    }
  });

  it('응답 JSON 형식 포함', () => {
    const prompt = buildSystemPrompt(mockCategories);
    expect(prompt).toContain('needsClarification');
    expect(prompt).toContain('suggestions');
    expect(prompt).toContain('categoryId');
  });

  it('빈 카테고리 → 에러 없이 프롬프트 생성', () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain('유효 카테고리 목록');
  });
});

describe('toGeminiContents', () => {
  const systemPrompt = 'SYSTEM_PROMPT';

  it('단일 user 메시지 → system prompt 합침', () => {
    const messages = [{ role: 'user', content: '검정 패딩' }];
    const contents = toGeminiContents(systemPrompt, messages);

    expect(contents).toHaveLength(1);
    expect(contents[0].role).toBe('user');
    expect(contents[0].parts[0].text).toContain('SYSTEM_PROMPT');
    expect(contents[0].parts[0].text).toContain('검정 패딩');
  });

  it('멀티턴 대화 → role 매핑 (assistant → model)', () => {
    const messages = [
      { role: 'user', content: '갈색 옷' },
      { role: 'assistant', content: '어떤 종류인가요?' },
      { role: 'user', content: '코트' },
    ];
    const contents = toGeminiContents(systemPrompt, messages);

    expect(contents).toHaveLength(3);
    expect(contents[0].role).toBe('user');
    expect(contents[1].role).toBe('model');
    expect(contents[2].role).toBe('user');
  });

  it('첫 메시지만 system prompt 포함, 나머지는 원문 그대로', () => {
    const messages = [
      { role: 'user', content: '갈색 옷' },
      { role: 'user', content: '코트' },
    ];
    const contents = toGeminiContents(systemPrompt, messages);

    expect(contents[0].parts[0].text).toContain('SYSTEM_PROMPT');
    expect(contents[1].parts[0].text).toBe('코트');
    expect(contents[1].parts[0].text).not.toContain('SYSTEM_PROMPT');
  });

  it('빈 messages → 빈 contents', () => {
    expect(toGeminiContents(systemPrompt, [])).toEqual([]);
  });
});

describe('COLOR_PRESETS (Edge Function)', () => {
  it('프론트엔드 colors.js와 동일 25개', () => {
    expect(COLOR_PRESETS).toHaveLength(25);
  });

  it('검정 hex = #333333', () => {
    const black = COLOR_PRESETS.find((p) => p.name === '검정');
    expect(black.hex).toBe('#333333');
  });
});
