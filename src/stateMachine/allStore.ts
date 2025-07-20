// import createStore from "./store-core";
import createReactStore from "./store-react";

const { state, actions } = createReactStore({
  state: { count: 0, count2: 10, user: "Anon" },

  actions: (set) => ({
    increment: () => set((prev) => ({ count: prev.count + 1 })),
    incrementBy: (value: number) => {
      set((prev) => ({ count: prev.count + value }));
    },
  }),
});

export { state, actions };
