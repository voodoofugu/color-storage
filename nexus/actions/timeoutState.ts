import { createActs } from "nexus-state";

import type { MyState } from "../types";

const timeoutState = createActs<MyState>((_, set) => ({
  setStateWithTimeout: <K extends keyof MyState>(
    stateKey: K,
    temporaryValue: MyState[K],
    duration: number
  ) => {
    set((state) => {
      const hasTimeout = stateKey in state.timeouts;

      // если уже есть таймер, значит originalValue уже сохранён — просто обновим таймер
      const originalValue = hasTimeout
        ? state.timeouts[stateKey].originalValue
        : state[stateKey];

      // если таймер уже есть, очистим его
      const prevTimeout = hasTimeout ? state.timeouts[stateKey].id : null;
      if (prevTimeout) clearTimeout(prevTimeout);

      const timeoutId = setTimeout(() => {
        set((current) => {
          const { [stateKey]: _, ...newTimeouts } = current.timeouts;

          return {
            [stateKey]: originalValue,
            timeouts: newTimeouts,
          };
        });
      }, duration);

      return {
        [stateKey]: temporaryValue,
        timeouts: {
          ...state.timeouts,
          [stateKey]: {
            id: timeoutId,
            originalValue,
          },
        },
      };
    });
  },
}));

export default timeoutState;
