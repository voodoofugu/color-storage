import { createReactStore } from "nexus-state";

type MyStateT = {
  mainColor: string;
  activeColor: string;
  failedColorAdding: boolean;
  colorStorage: Array<Record<string, string[]>>;
  timeouts: Record<
    string,
    {
      id: ReturnType<typeof setTimeout>;
      originalValue: MyStateT[keyof MyStateT];
    }
  >;
  copiedColorFlag: boolean;
};

const { state, actions } = createReactStore({
  state: {
    mainColor: "#ffffff",
    activeColor: "#ffffff",
    failedColorAdding: false,
    colorStorage: [
      {
        "palette-1": ["#fbff00"],
      },
      {
        "palette-2": [],
      },
    ],
    timeouts: {},
    copiedColorFlag: false,
  } as MyStateT,

  actions: (set) => {
    const self = {
      setStateWithTimeout: <K extends keyof MyStateT>(
        stateKey: K,
        temporaryValue: MyStateT[K],
        duration: number
      ) => {
        set((prev) => {
          const hasTimeout = stateKey in prev.timeouts;

          // если уже есть таймер, значит originalValue уже сохранён — просто обновим таймер
          const originalValue = hasTimeout
            ? prev.timeouts[stateKey].originalValue
            : prev[stateKey];

          // если таймер уже есть, очистим его
          const prevTimeout = hasTimeout ? prev.timeouts[stateKey].id : null;
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
              ...prev.timeouts,
              [stateKey]: {
                id: timeoutId,
                originalValue,
              },
            },
          };
        });
      },

      setMainColor: (color: string) => {
        set({ mainColor: color });
      },

      setActiveColor: (color: string) => {
        set({ activeColor: color });
      },

      setNewPalette: (paletteName: string) => {
        set((prev) => ({
          colorStorage: [...prev.colorStorage, { [paletteName]: [] }],
        }));
      },

      setNewPaletteColor: (paletteName: string, color: string) => {
        let isDuplicate = false;

        set((prev) => {
          isDuplicate = prev.colorStorage.some((palette) => {
            const [name, colors] = Object.entries(palette)[0];
            return name === paletteName && colors.includes(color);
          });

          if (isDuplicate) return prev;

          return {
            colorStorage: prev.colorStorage.map((palette) => {
              const [name, colors] = Object.entries(palette)[0];
              return name === paletteName
                ? { [name]: [color, ...colors] }
                : palette;
            }),
          };
        });

        if (isDuplicate) {
          self.setStateWithTimeout("failedColorAdding", true, 600);
        }
      },
    };

    return self;
  },
});

export { state, actions };
