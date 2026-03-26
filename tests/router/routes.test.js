import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HashRouter } from '../../src/router/routes.js';

function createMockHost() {
  return {
    addController: vi.fn(),
    requestUpdate: vi.fn(),
  };
}

const routes = [
  { path: '/', render: () => 'home' },
  { path: '/closet', render: () => 'closet' },
  { path: '/chat', render: () => 'chat' },
  { path: '*', render: () => '404' },
];

describe('HashRouter', () => {
  let host;
  let router;

  beforeEach(() => {
    host = createMockHost();
    window.location.hash = '';
    router = new HashRouter(host, routes);
  });

  afterEach(() => {
    router.hostDisconnected();
    window.location.hash = '';
  });

  it('생성 시 host.addController 호출', () => {
    expect(host.addController).toHaveBeenCalledWith(router);
  });

  it('hostConnected → 현재 해시로 라우트 resolve', () => {
    window.location.hash = '#/closet';
    router.hostConnected();
    expect(router.current.path).toBe('/closet');
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it('빈 해시 → / 라우트 매칭', () => {
    window.location.hash = '';
    router.hostConnected();
    expect(router.current.path).toBe('/');
  });

  it('navigate → hash 변경', () => {
    router.hostConnected();
    router.navigate('/chat');
    expect(window.location.hash).toBe('#/chat');
  });

  it('매칭 안 되는 경로 → * 폴백', () => {
    window.location.hash = '#/unknown';
    router.hostConnected();
    expect(router.current.path).toBe('*');
  });

  it('outlet → 현재 라우트 render 결과', () => {
    window.location.hash = '#/closet';
    router.hostConnected();
    expect(router.outlet()).toBe('closet');
  });

  it('hashchange 이벤트 → 라우트 업데이트', async () => {
    router.hostConnected();
    window.location.hash = '#/chat';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(router.current.path).toBe('/chat');
  });

  it('current가 null일 때 outlet → 빈 문자열', () => {
    // hostConnected 전에는 current=null
    expect(router.outlet()).toBe('');
  });

  it('hostDisconnected 후 hashchange → 반응 안 함', () => {
    router.hostConnected();
    host.requestUpdate.mockClear();
    router.hostDisconnected();

    window.location.hash = '#/closet';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(host.requestUpdate).not.toHaveBeenCalled();
  });
});
