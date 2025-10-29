import type { PopupContentT } from "../src/components/PopupWindow";

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
  themeSettings: "light" | "dark" | "system" | null;
};

export type { MyStateT };
