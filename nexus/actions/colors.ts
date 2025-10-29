import { createActs } from "nexus-state";

import type { MyStateT } from "../types";

const colors = createActs<MyStateT>((_, set) => ({
  setMainColor: (color: string) => {
    set({ mainColor: color });
  },

  setNewColorsOrder: (newOrder: string[]) => {
    set((state) => ({
      colorStorage: state.colorStorage.map((palette) => {
        const [name, _] = Object.entries(palette)[0];
        return name ===
          Object.keys(state.colorStorage[state.currentPaletteId])[0]
          ? { [name]: newOrder }
          : palette;
      }),
    }));
  },

  clearColor: (color: string) => {
    set((state) => ({
      colorStorage: state.colorStorage.map((palette) => {
        const [name, colors] = Object.entries(palette)[0];
        return {
          [name]: colors.filter((c) => c !== color),
        };
      }),
    }));
  },
}));

export default colors;
