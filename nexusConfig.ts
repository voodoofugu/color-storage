import { createReactStore } from "nexus-state";
import { setManagedTask } from "./src/helpers/taskManager";

import type { PopupContentT } from "./src/components/PopupWindow";

type MyStateT = {
  isPro: boolean;
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
  currentPaletteId: number;
  popupContent:
    | PopupContentT
    | null
    | { content: PopupContentT | null; props?: { [key: string]: unknown } };
  paletteHidden: boolean;
  userData: Record<string, string> | null;
  themeSettings: "light" | "dark" | "system";
};

const { state, actions } = createReactStore({
  state: {
    isPro: true,
    mainColor: "#ffffff", // hex only
    activeColor: "",
    failedColorAdding: false,
    colorStorage: [],
    timeouts: {},
    copiedColorFlag: false,
    currentPaletteId: 0,
    popupContent: null,
    paletteHidden: false,
    userData: null,
    themeSettings: "system",
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

      setNewPalette: (paletteName?: string) => {
        set((prev) => {
          const existingNames = prev.colorStorage.map(
            (item) => Object.keys(item)[0]
          );

          const getNextAvailableName = (): string => {
            let index = prev.colorStorage.length + 1;
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
            colorStorage: [...prev.colorStorage, { [uniqueName]: [] }],
          };
        });
      },

      setCurrentPaletteId: (id?: number) => {
        set((prev) => ({
          currentPaletteId:
            typeof id === "number" ? id : prev.colorStorage.length - 1,
        }));
      },

      setNewPaletteColor: (color: string) => {
        let isDuplicate = false;

        set((prev) => {
          isDuplicate = prev.colorStorage.some((palette) => {
            const [name, colors] = Object.entries(palette)[0];
            return (
              name ===
                Object.keys(prev.colorStorage[prev.currentPaletteId])[0] &&
              colors.includes(color)
            );
          });

          if (isDuplicate) return prev;

          return {
            colorStorage: prev.colorStorage.map((palette, index) => {
              const [name, colors] = Object.entries(palette)[0];
              return index === prev.currentPaletteId
                ? { [name]: [color, ...colors] }
                : palette;
            }),
          };
        });

        if (isDuplicate) {
          self.setStateWithTimeout("failedColorAdding", true, 600);
        }
      },

      paletteRename: (newName: string) => {
        set((prev) => ({
          colorStorage: prev.colorStorage.map((palette) => {
            const [name, colors] = Object.entries(palette)[0];
            return name ===
              Object.keys(prev.colorStorage[prev.currentPaletteId])[0]
              ? { [newName]: colors }
              : palette;
          }),
        }));
      },

      deleteCurrentPalette: (currentPaletteId: number) => {
        set((prev) => ({
          colorStorage: prev.colorStorage.filter(
            (_, index) => index !== currentPaletteId
          ),
          currentPaletteId:
            prev.currentPaletteId === 0 ? 0 : prev.currentPaletteId - 1,
        }));
      },

      setNewColorsOrder: (newOrder: string[]) => {
        set((prev) => ({
          colorStorage: prev.colorStorage.map((palette) => {
            const [name, _] = Object.entries(palette)[0];
            return name ===
              Object.keys(prev.colorStorage[prev.currentPaletteId])[0]
              ? { [name]: newOrder }
              : palette;
          }),
        }));
      },

      clearColor: (color: string) => {
        set((prev) => ({
          colorStorage: prev.colorStorage.map((palette) => {
            const [name, colors] = Object.entries(palette)[0];
            return {
              [name]: colors.filter((c) => c !== color),
            };
          }),
        }));
      },

      popupOpen: (
        content: PopupContentT | null,
        props?: { [key: string]: unknown }
      ) => {
        const currentPopup = state.getNexus("popupContent");
        if (currentPopup) {
          self.popupClose();

          setManagedTask(
            () => {
              self.popupOpen(content, props);
            },
            200,
            "popupReopen"
          );
          return;
        }

        set({ popupContent: props ? { content, props } : content });

        const popupEl = document.querySelector(
          `.popup-window`
        ) as HTMLDivElement;
        popupEl!.classList.add("opening");

        setTimeout(() => {
          popupEl!.classList.remove("opening");
        }, 200);
      },

      popupClose: () => {
        const popup = document.querySelector(`.popup-window`)!;

        if (popup) {
          popup.classList.add("closing");
        }

        setManagedTask(
          () => {
            set({ popupContent: null });
            popup!.classList.remove("closing");
          },
          200,
          "popupClose"
        );
      },
    };

    return self;
  },
});

export { state, actions };
