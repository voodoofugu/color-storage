import { createReactStore } from "nexus-state";

import colors from "./nexus/actions/colors";
import palette from "./nexus/actions/palette";
import popup from "./nexus/actions/popup";
import timeoutState from "./nexus/actions/timeoutState";

import type { MyStateT } from "./nexus/types";

const { store, actions } = createReactStore({
  state: {
    isPro: false,
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

  actions: [colors, palette, popup, timeoutState],
});

export { store, actions };
