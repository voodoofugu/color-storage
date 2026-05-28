import { createActs } from "nexus-state";
import { setTask, setLockTask, hasTask } from "keytask-core";

import nexus from "../../nexusConfig";

import type { MyState } from "../types";

let originalValue: null | any = null;

const timeoutState = createActs<MyState>(() => ({
  // TODO fix it
  setStateWithTimeout: <K extends keyof MyState>(
    stateKey: K,
    temporaryValue: MyState[K],
    duration: number,
  ) => {
    if (!originalValue) originalValue = nexus.get(stateKey);

    setLockTask(
      () => {
        nexus.set({ [stateKey]: temporaryValue });
      },
      duration,
      stateKey,
    );

    // setTask(
    //   () => {
    //     nexus.set({ [stateKey]: originalValue });
    //     originalValue = null;
    //   },
    //   duration,
    //   `${stateKey}2`,
    // );
    setTask(() => {
      nexus.set({ [stateKey]: originalValue });
      originalValue = null;
    }, duration);
  },
}));

export default timeoutState;
