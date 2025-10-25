import { createActions } from "nexus-state";

import type { MyStateT } from "../types";

const colors = createActions<MyStateT>((setNexus) => ({
  setMainColor: (color: string) => {
    setNexus({ mainColor: color });
  },

  setNewColorsOrder: (newOrder: string[]) => {
    setNexus((state) => ({
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
    setNexus((state) => ({
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
