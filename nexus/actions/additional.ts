import { createActs } from "nexus-state";

import { setTask } from "../../src/helpers/taskManager";

import type { MyState } from "../types";

const additional = createActs<MyState>((_, set) => ({
  syncStatusUpdate: (status: "success" | "error") => {
    set({ syncStatus: `${status} fadeIn` });

    setTask(
      () => {
        set({ syncStatus: `${status} fadeOut` });
      },
      1000,
      "syncStatus"
    );

    setTask(
      () => {
        set({ syncStatus: null });
      },
      1400,
      "syncStatus"
    );
  },
}));

export default additional;
