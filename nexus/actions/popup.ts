import { createActs } from "nexus-state";

import { setTask } from "../../src/helpers/taskManager";
import type { PopupContentT } from "../../src/components/PopupWindow";
import type { MyState } from "../types";

const popup = createActs<MyState>((get, set) => ({
  popupOpen(content: PopupContentT | null) {
    const currentPopup = get("popupContent");
    if (currentPopup) {
      this.popupClose();
      setTask(
        () => {
          this.popupOpen(content);
        },
        200,
        "popupReopen"
      );

      return;
    }

    set({ popupContent: content });

    const popupEl = document.querySelector(`.popup-window`) as HTMLDivElement;
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

    setTask(
      () => {
        set({ popupContent: null });
        popup!.classList.remove("closing");
      },
      200,
      "popupClose"
    );
  },

  clarificationOpen: (text: string, onConfirm: () => void) => {
    set({
      clarificationPopup: {
        text,
        onConfirm,
      },
    });

    const clarificationPopup = document.querySelector(`.clarification-window`);
    clarificationPopup!.classList.add("opening");

    setTimeout(() => {
      clarificationPopup!.classList.remove("opening");
    }, 200);
  },

  clarificationClose: () => {
    const clarificationPopup = document.querySelector(`.clarification-window`)!;

    if (clarificationPopup) {
      clarificationPopup.classList.add("closing");
    }

    setTask(
      () => {
        set({ clarificationPopup: null });
        clarificationPopup.classList.remove("closing");
      },
      200,
      "popupClose"
    );
  },
}));

export default popup;
