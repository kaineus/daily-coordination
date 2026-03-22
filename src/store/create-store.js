/**
 * createStore — zustand 스타일 상태 관리 팩토리
 *
 * @param {object} initialState
 * @param {(set: Function, get: Function) => object} [actionsFactory]
 * @returns {{ getState, setState, subscribe, actions }}
 */
export function createStore(initialState, actionsFactory) {
  let state = { ...initialState };
  const listeners = new Set();

  const getState = () => state;

  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    const prev = state;
    state = { ...state, ...next };

    const changed = Object.keys(next).some((k) => !Object.is(prev[k], state[k]));
    if (changed) {
      listeners.forEach((fn) => fn(state, prev));
    }
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const actions = actionsFactory ? actionsFactory(setState, getState) : {};

  return { getState, setState, subscribe, actions };
}
