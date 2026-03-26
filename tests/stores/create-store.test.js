import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../../src/store/create-store.js';

describe('createStore', () => {
  it('초기 상태 반환', () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('setState로 상태 업데이트', () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
  });

  it('setState 함수형 업데이트', () => {
    const store = createStore({ count: 0 });
    store.setState((prev) => ({ count: prev.count + 5 }));
    expect(store.getState().count).toBe(5);
  });

  it('setState는 기존 상태를 머지', () => {
    const store = createStore({ a: 1, b: 2 });
    store.setState({ a: 10 });
    expect(store.getState()).toEqual({ a: 10, b: 2 });
  });

  it('subscribe → 상태 변경 시 리스너 호출', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('동일 값 설정 시 리스너 호출 안 함', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 0 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('unsubscribe → 리스너 제거', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsub = store.subscribe(listener);

    unsub();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('actionsFactory로 액션 정의', () => {
    const store = createStore({ count: 0 }, (set, get) => ({
      increment: () => set({ count: get().count + 1 }),
      decrement: () => set({ count: get().count - 1 }),
    }));

    store.actions.increment();
    expect(store.getState().count).toBe(1);
    store.actions.decrement();
    expect(store.getState().count).toBe(0);
  });

  it('actionsFactory 없으면 빈 actions', () => {
    const store = createStore({ count: 0 });
    expect(store.actions).toEqual({});
  });

  it('복수 리스너 지원', () => {
    const store = createStore({ count: 0 });
    const l1 = vi.fn();
    const l2 = vi.fn();
    store.subscribe(l1);
    store.subscribe(l2);

    store.setState({ count: 1 });
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });
});
