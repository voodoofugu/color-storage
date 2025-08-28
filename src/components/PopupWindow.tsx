import { state, actions } from "../../nexusConfig.ts";

import Button from "./Button";
import PurchaseWindow from "./PurchaseWindow";

type PopupContentType = "SettingsWindow" | "PurchaseWindow";

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
    case "SettingsWindow":
      popupContentLocal = <SettingsWindow />;
      break;
    case "PurchaseWindow":
      popupContentLocal = <PurchaseWindow />;
      break;

    default:
      popupContentLocal = null;
      break;
  }

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

export type { PopupContentType };
