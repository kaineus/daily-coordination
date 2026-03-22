/**
 * HashRouter — hash 기반 SPA 라우터 (ReactiveController)
 */
export class HashRouter {
  #host;
  #routes;
  #current = null;
  #onHashChange;

  constructor(host, routes) {
    this.#host = host;
    this.#routes = routes;
    host.addController(this);
  }

  get current() {
    return this.#current;
  }

  hostConnected() {
    this.#onHashChange = () => this.#resolve();
    window.addEventListener('hashchange', this.#onHashChange);
    this.#resolve();
  }

  hostDisconnected() {
    window.removeEventListener('hashchange', this.#onHashChange);
  }

  navigate(path) {
    window.location.hash = path;
  }

  outlet() {
    return this.#current?.render() ?? '';
  }

  #resolve() {
    const hash = window.location.hash.slice(1) || '/';
    this.#current =
      this.#routes.find((r) => r.path === hash) ??
      this.#routes.find((r) => r.path === '*');
    this.#host.requestUpdate();
  }
}
