import { describe, it, expect, beforeEach } from 'vitest';
import { chatStore } from '../../src/store/chat.store.js';

describe('chatStore', () => {
  beforeEach(() => {
    chatStore.actions.reset();
  });

  it('초기 상태', () => {
    const s = chatStore.getState();
    expect(s.messages).toEqual([]);
    expect(s.loading).toBe(false);
  });

  it('addUserMessage', () => {
    chatStore.actions.addUserMessage('검정 패딩 등록해줘');
    const { messages } = chatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('검정 패딩 등록해줘');
  });

  it('addAssistantMessage — 기본값', () => {
    chatStore.actions.addAssistantMessage({ message: '패딩을 등록할게요!' });
    const msg = chatStore.getState().messages[0];
    expect(msg.role).toBe('assistant');
    expect(msg.content).toBe('패딩을 등록할게요!');
    expect(msg.items).toEqual([]);
    expect(msg.suggestions).toEqual([]);
    expect(msg.needsClarification).toBe(false);
  });

  it('addAssistantMessage — 되묻기', () => {
    chatStore.actions.addAssistantMessage({
      message: '어떤 종류의 옷인가요?',
      needsClarification: true,
      suggestions: ['🧥 코트', '👕 니트'],
    });
    const msg = chatStore.getState().messages[0];
    expect(msg.needsClarification).toBe(true);
    expect(msg.suggestions).toEqual(['🧥 코트', '👕 니트']);
  });

  it('addAssistantMessage — 파싱 결과 items', () => {
    const items = [{ categoryName: '패딩', color: '#333333', colorName: '검정' }];
    chatStore.actions.addAssistantMessage({ message: '등록할게요!', items });
    expect(chatStore.getState().messages[0].items).toEqual(items);
  });

  it('대화 순서 유지', () => {
    chatStore.actions.addUserMessage('검정 패딩');
    chatStore.actions.addAssistantMessage({ message: '등록!' });
    chatStore.actions.addUserMessage('흰 운동화도');
    const { messages } = chatStore.getState();
    expect(messages).toHaveLength(3);
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
  });

  it('setLoading', () => {
    chatStore.actions.setLoading(true);
    expect(chatStore.getState().loading).toBe(true);
  });

  it('reset → 초기화', () => {
    chatStore.actions.addUserMessage('테스트');
    chatStore.actions.setLoading(true);
    chatStore.actions.reset();
    expect(chatStore.getState().messages).toEqual([]);
    expect(chatStore.getState().loading).toBe(false);
  });
});
