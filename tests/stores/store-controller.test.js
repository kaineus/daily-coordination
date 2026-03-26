import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StoreController } from '../../src/store/store-controller.js';
import { createStore } from '../../src/store/create-store.js';

function createMockHost() {
  return {
    addController: vi.fn(),
    requestUpdate: vi.fn(),
  };
}

describe('StoreController', () => {
  let store;
  let host;

  beforeEach(() => {
    store = createStore({ count: 0, name: 'test' });
    host = createMockHost();
  });

  it('생성 시 host.addController 호출', () => {
    new StoreController(host, store);
    expect(host.addController).toHaveBeenCalled();
  });

  it('초기 value = 현재 상태', () => {
    const ctrl = new StoreController(host, store);
    expect(ctrl.value).toEqual({ count: 0, name: 'test' });
  });

  it('selector 적용', () => {
    const ctrl = new StoreController(host, store, (s) => s.count);
    expect(ctrl.value).toBe(0);
  });

  it('hostConnected → subscribe + 상태 변경 시 requestUpdate', () => {
    const ctrl = new StoreController(host, store, (s) => s.count);
    ctrl.hostConnected();

    store.setState({ count: 5 });
    expect(host.requestUpdate).toHaveBeenCalled();
    expect(ctrl.value).toBe(5);
  });

  it('선택 값 동일하면 requestUpdate 호출 안 함', () => {
    const ctrl = new StoreController(host, store, (s) => s.count);
    ctrl.hostConnected();

    store.setState({ name: 'changed' }); // count는 변하지 않음
    expect(host.requestUpdate).not.toHaveBeenCalled();
  });

  it('hostDisconnected → unsubscribe', () => {
    const ctrl = new StoreController(host, store, (s) => s.count);
    ctrl.hostConnected();
    ctrl.hostDisconnected();

    store.setState({ count: 99 });
    // disconnected 후에는 requestUpdate 안 됨
    expect(host.requestUpdate).not.toHaveBeenCalled();
  });

  it('hostConnected 재호출 시 최신 값 동기화', () => {
    const ctrl = new StoreController(host, store, (s) => s.count);
    ctrl.hostConnected();
    ctrl.hostDisconnected();

    store.setState({ count: 42 });

    ctrl.hostConnected();
    expect(ctrl.value).toBe(42);
  });
});
