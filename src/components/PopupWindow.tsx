import { useEffect } from "react";

import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";
import PurchaseWindow from "./popup/PurchaseWindow";
import NotificationsWindow from "./popup/NotificationsWindow";
import RestoreWindow from "./popup/RestoreWindow";

import { setManagedTask } from "../helpers/taskManager";

type PopupContentT =
  | "settingsWindow"
  | "purchaseWindow"
  | "restoreWindow"
  | "payment-notFinished"
  | "payment-success"
  | "payment-found"
  | "payment-notFound"
  | "payment-cancelled"
  | "payment-notExists"
  | "error";

function SettingsWindow() {
  return (
    <div className="settings-content">
      <h2>Settings</h2>
      <p>Adjust your preferences here.</p>
    </div>
  );
}

function PopupWindow() {
  const popupContent = state.useNexus("popupContent");
  let popupContentLocal;

  switch (popupContent) {
    case "settingsWindow":
      popupContentLocal = <SettingsWindow />;
      break;
    case "purchaseWindow":
      popupContentLocal = <PurchaseWindow />;
      break;
    case "restoreWindow":
      popupContentLocal = <RestoreWindow />;
      break;

    default:
      popupContentLocal = popupContent ? (
        <NotificationsWindow notifType={`${popupContent}`} />
      ) : null;
  }

  useEffect(() => {
    if (
      popupContent &&
      !["settingsWindow", "purchaseWindow", "restoreWindow"].includes(
        popupContent
      )
    ) {
      setManagedTask(() => actions.popupClose(), 6000, "autoClosePopup");
    }
  }, [popupContent]);

  return popupContent ? (
    <div className="popup-window">
      <div className="popup-bg"></div>

      {popupContentLocal}
      <Button svgID="plus" className="close-btn" onClick={actions.popupClose} />
    </div>
  ) : (
    <div className="popup-window" />
  );
}

export { SettingsWindow, PurchaseWindow };
export default PopupWindow;

export type { PopupContentT };
