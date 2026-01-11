import { useEffect } from "react";

import nexus from "../../nexusConfig.ts";

import Button from "./Button";
import PurchaseWindow from "./popup/PurchaseWindow";
import NotificationsWindow from "./popup/NotificationsWindow";
import SignInWindow from "./popup/SignInWindow";
import AccountWindow from "./popup/AccountWindow.tsx";

import { setTask, cancelTask } from "../helpers/taskManager";

type PopupContentT =
  | "accountWindow"
  | "purchaseWindow"
  | "signInWindow"
  // notifications without "...Window"
  | { text: string };

function PopupWindow() {
  const popupContent = nexus.use("popupContent");

  const popupType =
    popupContent && typeof popupContent === "object"
      ? "defaultInfo"
      : popupContent;
  const popupProps =
    popupContent && typeof popupContent === "object" ? popupContent : undefined;

  let popupContentLocal;

  switch (popupType) {
    case "accountWindow":
      popupContentLocal = <AccountWindow />;
      break;
    case "purchaseWindow":
      popupContentLocal = <PurchaseWindow />;
      break;
    case "signInWindow":
      popupContentLocal = <SignInWindow />;
      break;

    default:
      popupContentLocal = popupContent ? (
        <NotificationsWindow {...popupProps} />
      ) : null;
  }

  useEffect(() => {
    // regEx проверка заканчивается ли popupContent на "...Window" для закрытия
    if (popupType && !/Window$/i.test(popupType ? popupType : ""))
      setTask(() => nexus.acts.popupClose(), 6000, "autoClosePopup");

    return () => {
      cancelTask("autoClosePopup");
    };
  }, [popupType]);

  return popupContent ? (
    <div className="popup-window">
      <div className="popup-bg"></div>
      {popupContentLocal}
      <Button
        svgID="plus"
        className="withoutBg close-btn"
        onClick={nexus.acts.popupClose}
      />
    </div>
  ) : (
    <div className="popup-window" />
  );
}

export { AccountWindow, PurchaseWindow };
export default PopupWindow;

export type { PopupContentT };
