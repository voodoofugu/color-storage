import { createReactNexus } from "nexus-state";

import colors from "./nexus/actions/colors";
import palette from "./nexus/actions/palette";
import popup from "./nexus/actions/popup";
import timeoutState from "./nexus/actions/timeoutState";
import additional from "./nexus/actions/additional";

import type { MyState, MyActs } from "./nexus/types";

const nexus = createReactNexus<MyState, MyActs>({
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
    syncStatus: null,
  },

  acts: [colors, palette, popup, timeoutState, additional],
});

export default nexus;
