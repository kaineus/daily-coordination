/**
 * StoreController — Lit ReactiveController로 Store를 컴포넌트에 바인딩
 *
 * 사용법:
 *   #auth = new StoreController(this, authStore, s => s.user);
 *   render() { const user = this.#auth.value; }
 */
export class StoreController {
  #host;
  #store;
  #selector;
  #unsubscribe = null;
  #value;

  constructor(host, store, selector) {
    this.#host = host;
    this.#store = store;
    this.#selector = selector ?? ((s) => s);
    this.#value = this.#selector(store.getState());
    host.addController(this);
  }

  get value() {
    return this.#value;
  }

  hostConnected() {
    this.#unsubscribe = this.#store.subscribe((state) => {
      const next = this.#selector(state);
      if (!Object.is(next, this.#value)) {
        this.#value = next;
        this.#host.requestUpdate();
      }
    });
    // 연결 해제 중 상태가 변경되었을 수 있으므로 동기화
    this.#value = this.#selector(this.#store.getState());
  }

  hostDisconnected() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }
}
