import { useSyncExternalStore, useEffect, useState, useRef } from "react";

import createStore from "./store-core";
import type { Store } from "./store-core";

function createReactBindings<T extends Record<string, unknown>>(
  initialState: T
): Store<T> & {
  setState: (partial: Partial<T>) => void;
  useStore: {
    (): T;
    <K extends keyof T>(key: K): T[K];
  };
  useSelector: <R>(selector: (state: T) => R, dependencies: (keyof T)[]) => R;
} {
  const store = createStore(initialState);

  function useStore(): T;
  function useStore<K extends keyof T>(key: K): T[K];
  function useStore<K extends keyof T>(key?: K): T | T[K] {
    return useSyncExternalStore(
      (callback) => store.subscribe(key ? [key] : "*", callback),
      () => (key ? store.getState()[key] : store.getState())
    );
  }

  function useSelector<R>(
    selector: (state: T) => R,
    dependencies: (keyof T)[]
  ) {
    const lastSelected = useRef<R>(selector(store.getState()));
    const [selected, setSelected] = useState(() => selector(store.getState()));

    useEffect(() => {
      const callback = () => {
        const newSelected = selector(store.getState());
        if (newSelected !== lastSelected.current) {
          lastSelected.current = newSelected;
          setSelected(newSelected);
        }
      };

      const unsubscribe = store.subscribe(dependencies, callback);
      callback();

      return unsubscribe;
      // eslint-disable-next-line
    }, [selector]);

    return selected;
  }

  return {
    ...store,
    setState: store.update,
    useStore,
    useSelector,
  };
}

export default createReactBindings;
