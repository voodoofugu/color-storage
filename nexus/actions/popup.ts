import { createActions } from "nexus-state";

import { setManagedTask } from "../../src/helpers/taskManager";
import type { PopupContentT } from "../../src/components/PopupWindow";
import type { MyStateT } from "../types";

import { store } from "../../nexusConfig"; // решить это!

const popup = createActions<MyStateT>((setNexus) => ({
  popupOpen(content: PopupContentT | null, props?: { [key: string]: unknown }) {
    const currentPopup = store.getNexus("popupContent");
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

    setNexus({ popupContent: props ? { content, props } : content });

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
        setNexus({ popupContent: null });
        popup!.classList.remove("closing");
      },
      200,
      "popupClose"
    );
  },
}));

export default popup;
