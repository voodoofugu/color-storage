import { createReactNexus } from "nexus-state";

import colors from "./nexus/actions/colors";
import palette from "./nexus/actions/palette";
import popup from "./nexus/actions/popup";
import timeoutState from "./nexus/actions/timeoutState";

import type { MyStateT } from "./nexus/types";

const nexus = createReactNexus<MyStateT>({
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
    themeSettings: null,
    timestamp: 0,
  },

  acts: [colors, palette, popup, timeoutState],
});

export default nexus;
