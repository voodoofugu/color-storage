import { createActs } from "nexus-state";
import { setTask } from "keytask-core";

import nexus from "../../nexusConfig";

import type { MyState } from "../types";

const originalValues = new Map<keyof MyState, MyState[keyof MyState]>();

const timeoutState = createActs<MyState>(() => ({
  setStateWithTimeout: <K extends keyof MyState>(
    stateKey: K,
    temporaryValue: MyState[K],
    duration: number,
  ) => {
    if (!originalValues.has(stateKey)) {
      originalValues.set(stateKey, nexus.get(stateKey));
    }

    nexus.set({ [stateKey]: temporaryValue });

    setTask(
      () => {
        nexus.set({ [stateKey]: originalValues.get(stateKey) });
        originalValues.delete(stateKey);
      },
      duration,
      `setStateWithTimeout:${String(stateKey)}`,
    );
  },

  syncStatusUpdate: (status: "success" | "error") => {
    nexus.set({ syncStatus: `${status} fadeIn` });

    setTask(
      () => {
        nexus.set({ syncStatus: `${status} fadeOut` });
      },
      1200,
      "syncStatusFadeOut",
    );

    setTask(
      () => {
        nexus.set({ syncStatus: null });
      },
      1600,
      "syncStatusReset",
    );
  },
}));

export default timeoutState;
