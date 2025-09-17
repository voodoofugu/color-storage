import { useEffect } from "react";

import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";
import PurchaseWindow from "./popup/PurchaseWindow";
import NotificationsWindow from "./popup/NotificationsWindow";
import RestoreWindow from "./popup/RestoreWindow";
import SettingsWindow from "./popup/SettingsWindow";

import { setManagedTask, clearManagedTask } from "../helpers/taskManager";

type NotifT =
  | "payment-notFinished"
  | "payment-success"
  | "payment-found"
  | "payment-notFound"
  | "payment-cancelled"
  | "payment-notExists"
  | "restore-limit"
  | "error";

type PopupContentT =
  | "settingsWindow"
  | "purchaseWindow"
  | "restoreWindow"
  // notifications without "...Window"
  | NotifT;

function PopupWindow() {
  const popupContent = state.useNexus("popupContent");

  const popupType =
    popupContent && typeof popupContent === "object"
      ? popupContent.content
      : popupContent;
  const popupProps =
    popupContent && typeof popupContent === "object"
      ? popupContent.props
      : undefined;

  let popupContentLocal;

  switch (popupType) {
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
        <NotificationsWindow notifType={popupType} props={popupProps} />
      ) : null;
  }

  useEffect(() => {
    // regEx проверка заканчивается ли popupContent на "...Window"
    if (popupType && !/Window$/i.test(popupType ? popupType : ""))
      setManagedTask(() => actions.popupClose(), 6000, "autoClosePopup");

    return () => {
      clearManagedTask("autoClosePopup");
    };
  }, [popupType]);

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

export type { PopupContentT, NotifT };
