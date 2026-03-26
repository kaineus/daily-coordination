/**
 * F4 통합 테스트 — chat-register 파싱 → addClothing 등록 흐름
 * TC-F4-INT-001 ~ INT-004 (테스트 계획 참조)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chatStore } from '../../src/store/chat.store.js';
import { closetStore } from '../../src/store/closet.store.js';
import { sendChatMessage } from '../../src/services/chat.service.js';
import { addClothing } from '../../src/services/closet.service.js';

// Mock supabase
function createMockSupabase(session = { access_token: 'tok', user: { id: 'u1' } }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return {
    from: vi.fn().mockReturnValue(chain),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session } }) },
    _chain: chain,
  };
}

describe('F4 통합: 파싱 → 등록 흐름', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    chatStore.actions.reset();
    closetStore.setState({ categories: [], clothes: [], loading: false, error: null, groupBy: 'category' });
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('TC-F4-INT-001: 단일 아이템 파싱 → addClothing 호출', async () => {
    const supabase = createMockSupabase();
    const geminiResponse = {
      message: '검정 패딩을 등록할게요!',
      items: [{ categoryId: 'cat-1', categoryName: '패딩', categoryIcon: '🧥', color: '#333333', colorName: '검정' }],
      needsClarification: false,
      suggestions: [],
    };

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    // 1. 사용자 메시지 → chat-register 호출
    chatStore.actions.addUserMessage('검정 패딩 등록해줘');
    const { data } = await sendChatMessage(supabase, [{ role: 'user', content: '검정 패딩 등록해줘' }]);

    expect(data.items).toHaveLength(1);
    expect(data.items[0].categoryName).toBe('패딩');
    expect(data.items[0].color).toBe('#333333');

    // 2. assistant 메시지 저장
    chatStore.actions.addAssistantMessage(data);
    const msgs = chatStore.getState().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[1].items).toHaveLength(1);

    // 3. addClothing 호출 (등록 버튼 클릭 시뮬레이션)
    const registeredItem = {
      id: 'new-1',
      color: '#333333',
      color_name: '검정',
      category: { id: 'cat-1', name: '패딩', type: '아우터', icon: '🧥' },
    };
    supabase._chain.single.mockResolvedValue({ data: registeredItem, error: null });

    await addClothing(supabase, {
      categoryId: data.items[0].categoryId,
      color: data.items[0].color,
      colorName: data.items[0].colorName,
    });

    expect(supabase._chain.insert).toHaveBeenCalledWith({
      user_id: 'u1',
      category_id: 'cat-1',
      color: '#333333',
      color_name: '검정',
    });
  });

  it('TC-F4-INT-002: 복수 아이템 순차 등록', async () => {
    const supabase = createMockSupabase();
    const geminiResponse = {
      message: '2개 등록할게요!',
      items: [
        { categoryId: 'cat-1', categoryName: '니트', categoryIcon: '🧶', color: '#F5E6D3', colorName: '베이지' },
        { categoryId: 'cat-2', categoryName: '슬랙스', categoryIcon: '👖', color: '#1E3A8A', colorName: '네이비' },
      ],
      needsClarification: false,
      suggestions: [],
    };

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(geminiResponse),
    });

    const { data } = await sendChatMessage(supabase, [{ role: 'user', content: '베이지 니트랑 네이비 슬랙스' }]);
    expect(data.items).toHaveLength(2);

    // 각각 등록
    for (const item of data.items) {
      supabase._chain.single.mockResolvedValueOnce({
        data: { id: `new-${item.categoryName}`, color: item.color, color_name: item.colorName },
        error: null,
      });
      const result = await addClothing(supabase, {
        categoryId: item.categoryId,
        color: item.color,
        colorName: item.colorName,
      });
      expect(result.error).toBeNull();
    }

    expect(supabase._chain.insert).toHaveBeenCalledTimes(2);
  });

  it('TC-F4-INT-003: 되묻기 → 응답 → 등록 (멀티턴)', async () => {
    const supabase = createMockSupabase();

    // 첫 번째: 되묻기
    const clarificationResponse = {
      message: '어떤 종류의 옷인가요?',
      items: [],
      needsClarification: true,
      suggestions: ['🧥 코트', '🧶 니트', '👕 가디건'],
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(clarificationResponse),
    });

    chatStore.actions.addUserMessage('갈색 옷');
    const { data: first } = await sendChatMessage(supabase, [{ role: 'user', content: '갈색 옷' }]);
    chatStore.actions.addAssistantMessage(first);

    expect(first.needsClarification).toBe(true);
    expect(first.suggestions.length).toBeGreaterThan(0);

    // 두 번째: 카테고리 선택 → 확정
    const confirmResponse = {
      message: '브라운 코트를 등록할게요!',
      items: [{ categoryId: 'cat-coat', categoryName: '코트', categoryIcon: '🧥', color: '#4B3621', colorName: '브라운' }],
      needsClarification: false,
      suggestions: [],
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(confirmResponse),
    });

    chatStore.actions.addUserMessage('코트');
    const apiMessages = chatStore.getState().messages
      .filter((_, i) => i > 0)
      .map(({ role, content }) => ({ role, content }));

    const { data: second } = await sendChatMessage(supabase, apiMessages);
    chatStore.actions.addAssistantMessage(second);

    expect(second.needsClarification).toBe(false);
    expect(second.items[0].categoryName).toBe('코트');
    expect(second.items[0].color).toBe('#4B3621');

    // 대화 이력 확인
    const msgs = chatStore.getState().messages;
    expect(msgs).toHaveLength(4); // user, assistant(되묻기), user(선택), assistant(확정)
  });

  it('TC-F4-INT-004: 미로그인 상태에서 등록 시도 → 에러', async () => {
    const supabase = createMockSupabase(null); // no session

    const { data, error } = await sendChatMessage(supabase, [{ role: 'user', content: '검정 패딩' }]);
    expect(data).toBeNull();
    expect(error.message).toBe('인증 필요');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
