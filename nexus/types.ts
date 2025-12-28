import type { PopupContentT } from "../src/components/PopupWindow";

type MyState = {
  isPro: boolean;
  mainColor: string;
  activeColor: string;
  failedColorAdding: boolean;
  colorStorage: Array<Record<string, string[]>>;
  timeouts: Record<
    string,
    {
      id: ReturnType<typeof setTimeout>;
      originalValue: MyState[keyof MyState];
    }
  >;
  copiedColorFlag: boolean;
  currentPaletteId: number;
  paletteHidden: boolean;
  userData: Record<string, string> | null;
  themeSettings: "light" | "dark" | "system" | null;
  timestamp: number;
  syncStatus:
    | "pending"
    | "success fadeIn"
    | "success fadeOut"
    | "error fadeIn"
    | "error fadeOut"
    | null;
  readyToFetch: boolean;

  popupContent: PopupContentT | null;
  clarificationPopup: { text: string; onConfirm: () => void } | null;
};

type MyActs = {
  setMainColor: (color: string) => void;
  setActiveColor: (color: string) => void;
  setNewColorsOrder: (newOrder: string[]) => void;
  clearColor: (color: string) => void;
  setNewPalette: (paletteName?: string) => void;
  setCurrentPaletteId: (id?: number) => void;
  setNewPaletteColor: (color: string) => void;
  paletteRename: (newName: string) => void;
  deleteCurrentPalette: (currentPaletteId: number) => void;
  setStateWithTimeout: <K extends keyof MyState>(
    stateKey: K,
    temporaryValue: MyState[K],
    duration: number
  ) => void;
  syncStatusUpdate: (status: "success" | "error") => void;

  popupOpen: (
    content: MyState["popupContent"],
    props?: { [key: string]: unknown }
  ) => void;
  popupClose: () => void;
  clarificationClose: () => void;
  clarificationOpen: (text: string, onConfirm: () => void) => void;
};

export type { MyState, MyActs };
