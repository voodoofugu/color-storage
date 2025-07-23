import { createReactStore } from "nexus-state";

const { state, actions } = createReactStore({
  state: { count: 0 },

  actions: (set) => ({
    increment: () => set((prev) => ({ count: prev.count + 1 })),
  }),
});

export { state, actions };
