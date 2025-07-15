type Middleware<T> = (prevState: T, nextState: T) => T | void;

interface ReduxDevToolsConnection {
  send: (action: unknown, state: unknown) => void;
  init: (state: unknown) => void;
}

interface ReduxDevToolsExtension {
  connect(options: { name: string }): ReduxDevToolsConnection;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension;
  }
}

interface Store<T> {
  getState: () => T;
  update: (partial: Partial<T>) => void;
  reset: () => void;
  subscribe(keys: (keyof T)[] | "*", listener: () => void): () => void;
  addMiddleware: (fn: Middleware<T>) => void;
}

function createStore<T extends Record<string, unknown>>(
  initialData: T
): Store<T> {
  let state: T = { ...initialData };
  const initialState: T = { ...initialData };

  const listeners = new Map<keyof T | "*", Set<() => void>>();
  const middlewares: Middleware<T>[] = [];

  const devtools =
    typeof window !== "undefined"
      ? window.__REDUX_DEVTOOLS_EXTENSION__?.connect({ name: "CustomStore" })
      : null;

  if (devtools) devtools.init(state);

  function notify(keys: (keyof T)[] | "*") {
    if (keys === "*") {
      listeners.get("*")?.forEach((cb) => cb());
      listeners.forEach((set, key) => {
        if (key !== "*") set.forEach((cb) => cb());
      });
      return;
    }
    keys.forEach((key) => {
      listeners.get(key)?.forEach((cb) => cb());
    });
    listeners.get("*")?.forEach((cb) => cb());
  }

  function getState(): T {
    return state;
  }

  function subscribe(keys: keyof T | (keyof T)[] | "*", listener: () => void) {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach((key) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(listener);
    });

    return () => {
      keysArray.forEach((key) => {
        listeners.get(key)?.delete(listener);
      });
    };
  }

  function update(partial: Partial<T>) {
    const prevState = { ...state };
    let nextState = { ...state, ...partial };

    middlewares.forEach((fn) => {
      const result = fn(prevState, nextState);
      if (result !== undefined) nextState = result;
    });

    const changedKeys: (keyof T)[] = [];

    for (const key in nextState) {
      if (state[key] !== nextState[key]) {
        changedKeys.push(key);
      }
    }

    if (changedKeys.length === 0) return;

    state = nextState;
    devtools?.send?.(
      { type: changedKeys.map((k) => `UPDATE ${String(k)}`).join(", ") },
      state
    );

    notify(changedKeys);
  }

  function reset() {
    const prevState = { ...state };
    state = { ...initialState };

    middlewares.forEach((fn) => fn(prevState, state));
    devtools?.send?.({ type: "RESET" }, state);

    notify("*");
  }

  function addMiddleware(fn: Middleware<T>) {
    middlewares.push(fn);
  }

  return {
    getState,
    update,
    reset,
    subscribe,
    addMiddleware,
  };
}

export type { Store };

export default createStore;
