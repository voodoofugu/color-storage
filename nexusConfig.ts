import { createReactNexus } from "nexus-state";

import colors from "./nexus/actions/colors";
import palette from "./nexus/actions/palette";
import popup from "./nexus/actions/popup";
import timeoutState from "./nexus/actions/timeoutState";
import additional from "./nexus/actions/additional";

import type { MyState, MyActs } from "./nexus/types";

// const userData = {
//   amount: "$5.00",
//   completed: "1/21/1970 10:47:25",
//   created: "12/27/2025 14:31:53",
//   deviceId: "296ed1e8",
//   email: "schilin.georg@gmail.com",
//   sid: "cs_test_a1m9rSfFdLpYrBq8ycdh4FyZurg9vSF7pRVILAZ8wwqodDrZkOxtZiJ3I3",
//   status: "paid",
// };

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
    paletteHidden: false,
    userData: null,
    themeSettings: null,
    timestamp: 0,
    syncStatus: null,
    readyToFetch: false,

    popupContent: null,
    clarificationPopup: null,
  },

  acts: [colors, palette, popup, timeoutState, additional],
});

export default nexus;
