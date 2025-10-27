import { createActs } from "nexus-state";

import { setManagedTask } from "../../src/helpers/taskManager";
import type { PopupContentT } from "../../src/components/PopupWindow";
import type { MyStateT } from "../types";

const popup = createActs<MyStateT>((get, set) => ({
  popupOpen(content: PopupContentT | null, props?: { [key: string]: unknown }) {
    const currentPopup = get("popupContent");
    if (currentPopup) {
      this.popupClose();

      setManagedTask(
        () => {
          this.popupOpen(content, props);
        },
        200,
        "popupReopen"
      );
      return;
    }

    set({ popupContent: props ? { content, props } : content });

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

    setManagedTask(
      () => {
        set({ popupContent: null });
        popup!.classList.remove("closing");
      },
      200,
      "popupClose"
    );
  },
}));

export default popup;
