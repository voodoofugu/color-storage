import { createActs } from "nexus-state";

import type { MyState } from "../types";

const palette = createActs<MyState>((_, set) => ({
  setNewPalette: (paletteName?: string) => {
    set((state) => {
      const existingNames = state.colorStorage.map(
        (item) => Object.keys(item)[0]
      );

      const getNextAvailableName = (): string => {
        let index = state.colorStorage.length + 1;
        while (existingNames.includes(`Palette-${index}`)) {
          index++;
        }
        return `Palette-${index}`;
      };

      const uniqueName =
        paletteName && !existingNames.includes(paletteName)
          ? paletteName
          : getNextAvailableName();

      return {
        colorStorage: [...state.colorStorage, { [uniqueName]: [] }],
      };
    });
  },

  setCurrentPaletteId: (id?: number) => {
    set((state) => ({
      currentPaletteId:
        typeof id === "number" ? id : state.colorStorage.length - 1,
    }));
  },

  setNewPaletteColor(color: string) {
    let isDuplicate = false;

    set((state) => {
      isDuplicate = state.colorStorage.some((palette) => {
        const [name, colors] = Object.entries(palette)[0];
        return (
          name === Object.keys(state.colorStorage[state.currentPaletteId])[0] &&
          colors.includes(color)
        );
      });

      if (isDuplicate) return state;

      return {
        colorStorage: state.colorStorage.map((palette, index) => {
          const [name, colors] = Object.entries(palette)[0];
          return index === state.currentPaletteId
            ? { [name]: [color, ...colors] }
            : palette;
        }),
      };
    });

    if (isDuplicate) {
      this.setStateWithTimeout("failedColorAdding", true, 600);
    }
  },

  paletteRename: (newName: string) => {
    set((state) => ({
      colorStorage: state.colorStorage.map((palette) => {
        const [name, colors] = Object.entries(palette)[0];
        return name ===
          Object.keys(state.colorStorage[state.currentPaletteId])[0]
          ? { [newName]: colors }
          : palette;
      }),
    }));
  },

  deleteCurrentPalette: (currentPaletteId: number) => {
    set((state) => ({
      colorStorage: state.colorStorage.filter(
        (_, index) => index !== currentPaletteId
      ),
      currentPaletteId:
        state.currentPaletteId === 0 ? 0 : state.currentPaletteId - 1,
    }));
  },
}));

export default palette;
